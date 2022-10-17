import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import InputImg from './components/InputImg'

const ESCAPE_KEY = 'Escape'

interface IMarkInfo {
  key: string
  top: number
  left: number
  ratioToImgWidth: number
  ratioToImgHeight: number
  text: string
}

function App() {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const [initialImgWidth, setInitialImgWidth] = useState<number>(0)
  const [isInitAdaptiveWidth, setIsInitAdaptiveWidth] = useState<boolean>(false)
  const [fileBlob, setFileBlob] = useState<string>('')
  const [imgStyles, setImgStyles] = useState<object>({})
  const [currentMarkText, setCurrentMarkText] = useState<string>('')
  const [marksInfo, setMarksInfo] = useState<IMarkInfo[]>([])
  const [enableInputText, setEnableInputText] = useState<boolean>(false)

  useLayoutEffect(() => {
    function updateCoordinates() {
      const imgSizes = imgRef.current?.getBoundingClientRect() as DOMRect

      if (imgSizes) {
        const { width, height } = imgSizes

        if (!isInitAdaptiveWidth) {
          if (initialImgWidth >= window.innerWidth - 20) {
            setImgStyles({ width: '100%' })
          } else if (initialImgWidth < window.innerWidth - 20) {
            setImgStyles({ height: window.innerHeight - 20 })
          }
        }

        const currentMarksInfo = marksInfo.map((m: IMarkInfo) => ({
          ...m,
          left: m.ratioToImgWidth * width,
          top: m.ratioToImgHeight * height
        }))
        setMarksInfo(currentMarksInfo)
      }
    }

    window.addEventListener('resize', updateCoordinates)

    return () => window.removeEventListener('resize', updateCoordinates)
  }, [initialImgWidth, isInitAdaptiveWidth, marksInfo])

  useEffect(() => {
    if (enableInputText && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [enableInputText, textareaRef])

  const setInitialImgStyleAndSize = (img: HTMLImageElement) => {
    const { width, height } = img
    if (width >= height) {
      setIsInitAdaptiveWidth(true)
      setImgStyles({ width: '100%' })
    } else {
      const newHeight = window.innerHeight - 20
      const ratio = newHeight / height
      setInitialImgWidth(width * ratio)
      setImgStyles({ height: newHeight })
    }
  }

  const handleUploadFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    const { files } = e.target
    const file = files && files[0]

    if (file) {
      const img = new Image()
      const objectUrl = URL.createObjectURL(file)
      setFileBlob(objectUrl)
      img.src = objectUrl
      img.onload = function () {
        setInitialImgStyleAndSize(img)
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [])

  const handleSetMark = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = e
    const { width, height } = imgRef.current?.getBoundingClientRect() as DOMRect
    // correct a position of the text mark
    const top = clientY - 10
    const left = clientX - 4

    const newInfo: IMarkInfo = {
      key: `mark-${marksInfo.length}`,
      top,
      left,
      text: '',
      ratioToImgHeight: top / height,
      ratioToImgWidth: left / width
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

  const handleEscapeTextarea = (e: React.KeyboardEvent) => {
    if (e.key === ESCAPE_KEY) {
      handleInputTextBlur()
    }
  }

  const getMarkStyles = useCallback(({ top, left }: IMarkInfo): CSSProperties => {
    return {
      top: top - 8,
      left: left - 3,
      position: 'absolute'
    }
  }, [])

  return (
    <div>
      {!Boolean(fileBlob) && <InputImg handleUploadFile={handleUploadFile} />}
      <div id="editor-container">
        {Boolean(fileBlob) && (
          <img ref={imgRef} style={imgStyles} className="uploaded-img" alt="" src={fileBlob} onClick={handleSetMark} />
        )}
        {marksInfo.map(
          (info: IMarkInfo, i: number) =>
            info.text && (
              <div className="mark" key={`${info.text}-${i}`} style={getMarkStyles(info)}>
                {info.text}
              </div>
            )
        )}
        {enableInputText && (
          <textarea
            className="text-area"
            style={{ top: marksInfo[marksInfo.length - 1].top, left: marksInfo[marksInfo.length - 1].left }}
            ref={textareaRef}
            rows={1}
            onChange={handleChangeInputText}
            onBlur={handleInputTextBlur}
            onKeyDown={handleEscapeTextarea}
          />
        )}
      </div>
    </div>
  )
}

export default App
