import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'

interface IMarkInfo {
  key: string
  top: number
  left: number
  pageWidth: number
  pageHeight: number
  text: string
}

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [fileBlob, setFileBlob] = useState<string>('')
  const [imgStyles, setImgStyles] = useState<object>({})
  const [currentMarkText, setCurrentMarkText] = useState<string>('')
  const [marksInfo, setMarksInfo] = useState<IMarkInfo[]>([])
  const [enableInputText, setEnableInputText] = useState<boolean>(false)
  const [imgWidth, setImgWidth] = useState(0)
  const [imgHeight, setImgHeight] = useState(0)

  // useLayoutEffect(() => {
  //   function updateCoordinates() {
  //     const currentWidth = window.innerWidth
  //     const currentHeight = window.innerHeight
  //     const currentMarksInfo = marksInfo.map((m: IMarkInfo) => {
  //       if (m.pageWidth !== currentWidth) {

  //       }

  //       return m
  //     })
  //   }

  //   window.addEventListener('resize', updateCoordinates)

  //   return () => window.removeEventListener('resize', updateCoordinates)
  // }, [])

  useEffect(() => {
    if (enableInputText && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [enableInputText, textareaRef])

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const { files } = e.target
    const file = files && files[0]

    if (file) {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      setFileBlob(objectUrl)
      img.src = objectUrl
      img.onload = function () {
        const { width, height } = img
        setImgHeight(height)
        setImgWidth(width)
        if (width >= height) {
          setImgStyles({ width: '100%' })
        } else {
          setImgStyles({ height: '100%' })
        }
        URL.revokeObjectURL(objectUrl)
      }
    }
  }

  const handleSetMark = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e
    const newInfo: IMarkInfo = {
      key: `mark-${marksInfo.length}`,
      top: clientY - 10,
      left: clientX - 4,
      pageWidth: window.innerWidth,
      pageHeight: window.innerHeight,
      text: ''
    }
    setMarksInfo(info => [...info, newInfo])
    setEnableInputText(true)
  }

  const handleChangeInputText = ({ currentTarget: { value } }: React.SyntheticEvent<HTMLTextAreaElement>) => {
    setCurrentMarkText(value)
  }

  const handleInputTextBlur = () => {
    setEnableInputText(false)
    setMarksInfo((currentMarks: IMarkInfo[]) =>
      currentMarks.map((m, i) => {
        if (i === marksInfo.length - 1) {
          return { ...m, text: currentMarkText }
        }
        return m
      })
    )
    setCurrentMarkText('')
  }

  return (
    <div className="app">
      <input type="file" id="img" name="img" accept="image/*" multiple={false} onChange={handleUploadFile} />
      <div className="editor">
        {fileBlob && <img style={imgStyles} className="uploaded-img" alt="" src={fileBlob} onClick={handleSetMark} />}
        {marksInfo.map(
          (info: IMarkInfo, i: number) =>
            info.text && (
              <div
                className="mark"
                key={`${info.text}-${i}`}
                style={{ top: info.top - 8, left: info.left - 3, position: 'absolute' }}
              >
                {info.text}
              </div>
            )
        )}
        {enableInputText && (
          <textarea
            className="text-area"
            style={{ top: marksInfo[marksInfo.length - 1].top, left: marksInfo[marksInfo.length - 1].left }}
            ref={textareaRef}
            rows={3}
            onChange={handleChangeInputText}
            onBlur={handleInputTextBlur}
          />
        )}
      </div>
    </div>
  )
}

export default App
