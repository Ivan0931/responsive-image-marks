import React from 'react'
import { IMarkInfo } from './../interfaces'

interface IProps {
  marksInfo: IMarkInfo[]
  onChange: (e: React.SyntheticEvent<HTMLTextAreaElement>) => void
  onBlur: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

const InputText = React.forwardRef<HTMLTextAreaElement, IProps>(({ marksInfo, onChange, onBlur, onKeyDown }, ref) => {
  return (
    <textarea
      id="text-area"
      style={{ top: marksInfo[marksInfo.length - 1].top, left: marksInfo[marksInfo.length - 1].left }}
      ref={ref}
      rows={1}
      onChange={onChange}
      onBlur={onBlur}
      onKeyDown={onKeyDown}
    />
  )
})

export default InputText
