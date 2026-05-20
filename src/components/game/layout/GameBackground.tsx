import { createPortal } from 'react-dom'
import { useEffect, useState } from 'react'

import scenaBackground from '@/assets/scenes/scena1_back.svg'
import scenaBackground2 from '@/assets/scenes/scena1_back2.svg'
import scenaFrontInit from '@/assets/scenes/scena1_front_init.svg'
import scenaFrontSuccess from '@/assets/scenes/scena1_front_win.svg'
import { useGameStatus } from '@/context/GameStatusContext'
const portalRoot = document.getElementById('portal-root')

import './GameBackground.scss'
export function GameBackground() {
  const { status } = useGameStatus()

  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const images = [
      scenaBackground,
      scenaBackground2,
      scenaFrontInit,
      scenaFrontSuccess,
    ]

    Promise.all(
      images.map(
        (src) =>
          new Promise<void>((resolve) => {
            const img = new Image()
            img.src = src
            img.onload = () => resolve()
          })
      )
    ).then(() => setLoaded(true))
  }, [])

  if (!portalRoot || !loaded) return null

  const frontImage =
    status === 'success'
      ? scenaFrontSuccess
      : scenaFrontInit

  return createPortal(
    <div className="background">
      <div
        className="background__main"
        style={{
          backgroundImage: `url(${scenaBackground2})`
        }}
      />

      <div
        className="background__main"
        style={{
          backgroundImage: `url(${scenaBackground})`
        }}
      />

      <div
        className="background__front"
        style={{
          backgroundImage: `url(${frontImage})`
        }}
      />
    </div>,
    portalRoot
  )
}