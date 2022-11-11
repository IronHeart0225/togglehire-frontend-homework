import React, { useState, useRef, useEffect } from 'react'
import './DragDropFile.css'

const DragDropFile = (props) => {
  const { onSelectFiles, fileEmails, disabled, reset } = props
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const formRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (formRef) {
      setSelectedFiles([])
      formRef.current.reset()
    }
  }, [reset, formRef])

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleChange = (e) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const handleFiles = (files) => {
    setSelectedFiles(Array.from(files))
    if (onSelectFiles) {
      onSelectFiles(Array.from(files))
    }
  }

  return (
    <form
      id="form-file-upload"
      ref={formRef}
      onDragEnter={handleDrag}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        ref={inputRef}
        type="file"
        id="input-file-upload"
        multiple={true}
        onChange={handleChange}
        disabled={disabled}
      />
      <label
        id="label-file-upload"
        htmlFor="input-file-upload"
        className={
          dragActive
            ? `${disabled ? 'drag-disable' : 'drag-active'}`
            : !disabled
            ? 'cursor-pointer'
            : ''
        }
      >
        {selectedFiles.length > 0 ? (
          <ul>
            {selectedFiles.map((file, index) => (
              <li key={`file-${index}`} className="selected-file">
                {file.name}&nbsp;
                <span className="email-count">
                  {fileEmails[index]
                    ? `(${fileEmails[index].length} emails)`
                    : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="dnd-description">
            Drag and drop your file here or click to select file
          </div>
        )}
      </label>
      {dragActive && (
        <div
          id="drag-file-element"
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        ></div>
      )}
    </form>
  )
}

export default DragDropFile
