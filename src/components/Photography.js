import * as THREE from 'three'
import React, { useRef, useState } from "react";
import LogoComponent from "../subComponents/LogoComponent";
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Image, ScrollControls, Scroll, useScroll } from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { Minimap } from './Minimap'
import { state, damp } from './util'
import { Pin } from '../assets/allSvgs';
import '../styles.css'

function Item({ index, position, scale, c = new THREE.Color(), ...props }) {
  const ref = useRef()
  const scroll = useScroll()
  const { clicked, urls } = useSnapshot(state)
  const [hovered, hover] = useState(false)
  const click = () => (state.clicked = index === clicked ? null : index)
  const over = () => hover(true)
  const out = () => hover(false)
  useFrame((state, delta) => {
    const y = scroll.curve(index / urls.length - 1.5 / urls.length, 4 / urls.length)
    ref.current.material.scale[1] = ref.current.scale.y = damp(ref.current.scale.y, clicked === index ? 5 : 4 + y, 8, delta)
    ref.current.material.scale[0] = ref.current.scale.x = damp(ref.current.scale.x, clicked === index ? 4.7 : scale[0], 6, delta)
    if (clicked !== null && index < clicked) ref.current.position.x = damp(ref.current.position.x, position[0] - 2, 6, delta)
    if (clicked !== null && index > clicked) ref.current.position.x = damp(ref.current.position.x, position[0] + 2, 6, delta)
    if (clicked === null || clicked === index) ref.current.position.x = damp(ref.current.position.x, position[0], 6, delta)
    ref.current.material.grayscale = damp(ref.current.material.grayscale, hovered || clicked === index ? 0 : Math.max(0, 1 - y), 6, delta)
    ref.current.material.color.lerp(c.set(hovered || clicked === index ? 'white' : '#aaa'), hovered ? 0.3 : 0.1)
  })
  return <Image ref={ref} {...props} position={position} scale={scale} onClick={click} onPointerOver={over} onPointerOut={out} />
}

function Items({ w = 0.7, gap = 0.15 }) {
  const { urls } = useSnapshot(state)
  const { width } = useThree((state) => state.viewport)
  const xW = w + gap
  return (
    <ScrollControls horizontal damping={10} pages={(width - xW + urls.length * xW) / width} style={{overflow:'scroll'}}>
      <Minimap />
      <Scroll>
        {urls.map((url, i) => <Item key={i} index={i} position={[i * xW, 0, 0]} scale={[w, 4, 1]} url={url} />) /* prettier-ignore */}
      </Scroll>
    </ScrollControls>
  )
}
function Overlay() {
  return (
    <div className='overlay' style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', width: '100%', height: '100%', background:'../assets/bg3.jpg'}}>
      <nav className="nav nav--right js-nav">
        <ul>
          <li>
            <a href="https://www.instagram.com/aggie.pictures/" className="is-active"><span>instagram </span></a>
          </li>
        </ul>
      </nav>

      <figure className="logo">
        <img src="camera.png" width="166px" height="200px" alt="camera-logo"/>
      </figure>

      <div className="vert-text">
      <span>
        TAKING PHOTOS TO UNDERSTAND,
        <br />WHAT OUR LIVES MEAN TO US.
      </span>
    </div>
    <div className="pin">
      < Pin height={25} width={35} fill='white'/>
      <p>Located in:
        <br />Calgary</p>
    </div>
    </div>
  )
}

const Photography = () => {

  return (
    <>
    <LogoComponent />
    <Overlay />
    <Canvas gl={{ antialias: false }} dpr={[1, 1.5]} onPointerMissed={() => (state.clicked = null)} >
              <Items />
          </Canvas>
          
      </>
  )
}


export default Photography