import React, { useState } from 'react';
import * as API from './api/API';

const App = () => {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState([]);

  const onSelectFiles = (e) => {
    setStatus('');
    setFiles(Array.from(e.target.files));
  }

  const handleFileChosen = async (file) => {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = reject;
      fileReader.readAsText(file);
    });
  }

  const readAllFiles = async (allFiles) => {
    const results = await Promise.all(allFiles.map(async (file) => {
      const fileContents = await handleFileChosen(file);
      return fileContents?.split(/\r?\n/).filter(line => !!line);
    }));
    return results;
  }  

  const onSubmit = async (e) => {
    e.preventDefault();
    const results = await readAllFiles(files);
    const emails = results.flat();
    API.send(emails).then(res => {
      setStatus(res.error);
      if (res.error === 'success') {
        setErrors([]);
        setFiles([]);
        e.target.reset();
      } else if (res.error === 'server_error') {
        setErrors([]);
      } else {
        setErrors(res.emails);
      }
    });
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <input
          type="file"
          accept=".txt"
          multiple={true}
          onChange={onSelectFiles}
        />
      </div>
      {files.length > 0 && (
        <ul>
          {files.map(file => (
            <li key={`file-${file.name}`}>
              {file.name}
            </li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        disabled={files.length === 0}
      >Send emails</button>
      {status === 'success' ? (
        <p>Emails sent successfully!</p>
      ) : status === 'server_error' ? (
        <p>There was an error: server error!</p>
      ) : status !== '' ? (
        <div>
          <p>There was an error: Failed to send emails to some addresses</p>
          {errors.length > 0 && (
            <ul>
              {errors.map((email, idx) => (
                <li key={`email-${idx}`}>{email}</li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        null
      )}
    </form>
  );
}

export default App;
