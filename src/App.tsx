import React, { CSSProperties, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import './App.css'
import InputImg from './components/InputImg'
import UploadedImage from './components/UploadedImage'
import InputText from './components/InputText'
import { ESCAPE_KEY } from './constants'
import { IMarkInfo } from './interfaces'

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

  const updateMarksInfo = useCallback(
    ({ width, height }: DOMRect) => {
      const currentMarksInfo = marksInfo.map((m: IMarkInfo) => ({
        ...m,
        left: m.ratioToImgWidth * width,
        top: m.ratioToImgHeight * height
      }))
      setMarksInfo(currentMarksInfo)
    },
    [marksInfo]
  )

  const updateImgSizeOnResize = useCallback(() => {
    if (initialImgWidth >= window.innerWidth - 20) {
      setImgStyles({ width: '100%' })
    } else if (initialImgWidth < window.innerWidth - 20) {
      setImgStyles({ height: window.innerHeight - 20 })
    }
  }, [initialImgWidth])

  useLayoutEffect(() => {
    function updateImgStylesAndSize() {
      const imgElement = imgRef.current?.getBoundingClientRect() as DOMRect

      if (imgElement) {
        if (!isInitAdaptiveWidth) {
          updateImgSizeOnResize()
        }
        updateMarksInfo(imgElement)
      }
    }

    window.addEventListener('resize', updateImgStylesAndSize)

    return () => window.removeEventListener('resize', updateImgStylesAndSize)
  }, [initialImgWidth, isInitAdaptiveWidth, updateImgSizeOnResize, updateMarksInfo])

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
      // correct a position
      top: top - 8,
      left: left - 3,
      position: 'absolute'
    }
  }, [])

  return (
    <div>
      {!Boolean(fileBlob) && <InputImg handleUploadFile={handleUploadFile} />}
      <div id="editor-container">
        <UploadedImage ref={imgRef} src={fileBlob} style={imgStyles} onClick={handleSetMark} />
        {marksInfo.map(
          (info: IMarkInfo, i: number) =>
            info.text && (
              <div className="mark" key={`${info.text}-${i}`} style={getMarkStyles(info)}>
                {info.text}
              </div>
            )
        )}
        {enableInputText && (
          <InputText
            ref={textareaRef}
            marksInfo={marksInfo}
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
