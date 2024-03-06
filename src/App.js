import './App.css';
import { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const TodoItemInputField = (props) => {
  const [input, setInput] = useState("");

  const onSubmit = () => {
    props.onSubmit(input);
    setInput("");
  }

  return (<div>
    <TextField
      id="todo-item-input"
      label="Todo item"
      variant="outlined" 
      value={input} 
      onChange = {(e) => setInput(e.target.value)}
    />
    <Button variant="outlined" onClick={onSubmit}>Submit</Button>
  </div>);
};
  

function App() {
  return (
    <div className="App">
      <TodoItemInputField onSubmit={() => {}} />
    </div>
  );
}

export default App;
