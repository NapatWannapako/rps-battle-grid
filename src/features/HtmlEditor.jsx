// components/HtmlEditor.jsx
import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

class HtmlEditor extends React.Component {
  handleEditorChange = (content, editor) => {
    this.props.onChange?.(content);
  };

  render() {
    return (
      <Editor
        apiKey="no-api-key" // หรือใช้ API key ถ้าใช้งานแบบ cloud
        initialValue="<p>เริ่มพิมพ์ที่นี่...</p>"
        init={{
          height: 300,
          menubar: false,
          plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
          ],
          toolbar:
            'undo redo | formatselect | bold italic backcolor | \
            alignleft aligncenter alignright alignjustify | \
            bullist numlist outdent indent | removeformat | help'
        }}
        onEditorChange={this.handleEditorChange}
      />
    );
  }
}

export default HtmlEditor;
