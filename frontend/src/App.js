import React, { useState } from 'react'
import Spinner from './components/spinner/Spinner'
import DragDropFile from './components/dragdrop/DragDropFile'
import * as API from './api/API'
import './App.css'

const App = () => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [fileEmails, setFileEmails] = useState([])
  const [sendStatus, setSendStatus] = useState('')
  const [errorEmails, setErrorEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [reset, setReset] = useState(false)

  const onSelectFiles = (files) => {
    setSendStatus('')
    setSelectedFiles(files)
  }

  const handleFileChosen = async (file) => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader()
      fileReader.onload = () => {
        resolve(fileReader.result)
      }
      fileReader.onerror = reject
      fileReader.readAsText(file)
    })
  }

  const readAllFiles = async (allFiles) => {
    const results = await Promise.all(
      allFiles.map(async (file) => {
        const fileContents = await handleFileChosen(file)
        return fileContents?.split(/\r?\n/).filter((line) => !!line)
      })
    )
    return results
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const results = await readAllFiles(selectedFiles)
    setFileEmails(results)
    const emails = results.flat()
    API.send(emails).then((res) => {
      setLoading(false)
      setSendStatus(res.error)
      if (res.error === 'success') {
        setErrorEmails([])
        setSelectedFiles([])
        e.target.reset()
        setReset(!reset)
      } else if (res.error === 'server_error') {
        setErrorEmails([])
      } else {
        setErrorEmails(res.emails)
      }
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>Toggl Frontend Homework</h1>
      <DragDropFile
        onSelectFiles={onSelectFiles}
        fileEmails={fileEmails}
        disabled={loading}
        reset={reset}
      />
      {/* <input
        type="file"
        accept=".txt"
        multiple={true}
        onChange={onSelectFiles}
      /> */}
      <div className="submit-group">
        <button
          type="submit"
          className="btn btn-success send-email"
          disabled={selectedFiles.length === 0 || loading}
        >
          Send emails
        </button>
        {loading && <Spinner />}
      </div>
      {sendStatus === 'success' ? (
        <p className="text-success">Emails sent successfully!</p>
      ) : sendStatus === 'server_error' ? (
        <p className="text-error">There was an error: server error!</p>
      ) : sendStatus !== '' ? (
        <div>
          <p className="text-error">
            There was an error: Failed to send emails to some addresses
          </p>
          {errorEmails.length > 0 && (
            <ul>
              {errorEmails.map((email, index) => (
                <li key={`email-${index}`}>{email}</li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </form>
  )
}

export default App
