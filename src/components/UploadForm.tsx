import { useDropzone } from 'react-dropzone';
import { useState } from 'react';

const { getRootProps, getInputProps } = useDropzone({
  accept: '.pdf',
  multiple: true,
  onDrop: (acceptedFiles) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
  },
});

const [files, setFiles] = useState([]);
const [uploadProgress, setUploadProgress] = useState(0);
const [isLoading, setIsLoading] = useState(false);

const handleUpload = (files) => {
  setIsLoading(true);
  // Simulate upload progress
  files.forEach((file, index) => {
    setTimeout(() => {
      setUploadProgress((index + 1) / files.length * 100);
      if (index === files.length - 1) setIsLoading(false);
    }, 1000 * (index + 1));
  });
};

<input {...getInputProps()} />

{files.map(file => (
  <div key={file.path}>{file.path}</div>
))}

{isLoading && <div>Loading...</div>}
<div>Progress: {uploadProgress}%</div> 