import React from "react";
function Button(){
    // const name = "Click Me"
    // return <button> {name}
    // </button>;
const [text, setText] = useState("Click Me");
    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
        setText(isClicked ? "Click Me" : "Clicked!");
    };

    return (
        <button 
            onClick={handleClick}
            style={{
                padding: '10px 20px',
                backgroundColor: isClicked ? '#007bff' : '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
            }}
        >
            {text}
        </button>
    );


}export default Button;