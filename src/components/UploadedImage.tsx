import React, { CSSProperties } from 'react'

interface IProps {
  style?: CSSProperties
  src?: string
  onClick: (e: React.MouseEvent<HTMLElement>) => void
}

const UploadedImage = React.forwardRef<HTMLImageElement, IProps>((props, ref) => {
  return Boolean(props.src) ? <img ref={ref} id="uploaded-img" alt="uploaded" {...props} /> : null
})

export default UploadedImage
