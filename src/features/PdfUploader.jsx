// components/PdfUploader.jsx
import React from 'react';
import { useDropzone } from 'react-dropzone';

const PdfUploader = ({ onUpload }) => {
  const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
    accept: 'application/pdf',
    onDrop: (acceptedFiles) => {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);

      // ตัวอย่างการอัปโหลดไปที่ backend
      fetch('/upload-pdf', {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => {
          console.log('อัปโหลดสำเร็จ', data);
          onUpload?.(data);
        });
    },
  });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed #ccc', padding: 20 }}>
      <input {...getInputProps()} />
      <p>ลากไฟล์ PDF มาวางตรงนี้ หรือคลิกเพื่อเลือกไฟล์</p>
    </div>
  );
};

export default PdfUploader;
