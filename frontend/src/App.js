import React, { useState } from 'react';
import Spinner from './components/spinner/Spinner';
import * as API from './api/API';

const App = () => {
  const [files, setFiles] = useState([]);
  const [fileEmails, setFileEmails] = useState([]);
  const [status, setStatus] = useState('');
  const [errorEmails, setErrorEmails] = useState([]);
  const [loading, setLoading] = useState(false);

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
    setLoading(true);
    const results = await readAllFiles(files);
    setFileEmails(results);
    const emails = results.flat();
    API.send(emails).then(res => {
      setLoading(false);
      setStatus(res.error);
      if (res.error === 'success') {
        setErrorEmails([]);
        setFiles([]);
        e.target.reset();
      } else if (res.error === 'server_error') {
        setErrorEmails([]);
      } else {
        setErrorEmails(res.emails);
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
          {files.map((file, index) => (
            <li key={`file-${file.name}`}>
              {file.name} {fileEmails[index] ? `(${fileEmails[index].length} emails)` : ''}
            </li>
          ))}
        </ul>
      )}
      <button
        type="submit"
        disabled={files.length === 0}
      >Send emails</button>
      {loading && (
        <Spinner />
      )}
      {status === 'success' ? (
        <p>Emails sent successfully!</p>
      ) : status === 'server_error' ? (
        <p>There was an error: server error!</p>
      ) : status !== '' ? (
        <div>
          <p>There was an error: Failed to send emails to some addresses</p>
          {errorEmails.length > 0 && (
            <ul>
              {errorEmails.map((email, index) => (
                <li key={`email-${index}`}>{email}</li>
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
