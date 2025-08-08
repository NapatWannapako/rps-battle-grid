import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField  from '../../components/TextFeld/TextFeld'; // ตรวจสอบ path ให้ถูกต้อง
import './Home.css';
import UserList from "../User/User"

export default function Home() {
  const [isOpened, setIsOpened] = useState(false);
  const navigate = useNavigate();
   const [validateEnabled, setValidateEnabled] = useState(true); // ✅ toggle ได้

  // ประกาศ state แยกสำหรับชื่อและนามสกุล
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const handleClick = () => {
    if (isOpened) return;
    setIsOpened(true);
    setTimeout(() => {
      navigate('/game');
    }); // รอให้ animation เสร็จก่อนเปลี่ยนหน้า
  }; const handleSubmit = (e) => {
    e.preventDefault();

    if (validateEnabled && !name.trim()) {
      setError(true);
    } else {
      setError(false);
      alert("ส่งข้อมูลสำเร็จ!");
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome</h1>
      <TextField
        label="ชื่อ"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)} 
        enableValidation={validateEnabled} 
      />
      <TextField
        label="นามสกุล"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
          enableValidation={validateEnabled} 
          
      />
        <label style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={validateEnabled}
            onChange={(e) => setValidateEnabled(e.target.checked)}
          />
          เปิด Validate
        </label>
      {/* คุณอาจเพิ่มปุ่มเรียก handleClick */}
      <button onClick={handleClick}>ไปหน้า About</button>
      <UserList/>
    </div>
  );
}
