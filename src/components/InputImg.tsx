import React from 'react'

interface IInputImgProps {
  handleUploadFile: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const InputImg = ({ handleUploadFile }: IInputImgProps) => {
  return (
    <div id="image-container">
      <input type="file" id="img" name="img" accept="image/*" multiple={false} onChange={handleUploadFile} />
    </div>
  )
}

export default InputImg
