import './App.css';
import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

// FIREBASE START
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, setDoc, doc, deleteDoc, getDocs, query, orderBy, where } from "firebase/firestore";

import {
  GoogleAuthProvider,
  getAuth,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
  
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDc22ioyaNRosErtkzUXtKJ2rUKG8yDHkw",
  authDomain: "todo-list-web-1.firebaseapp.com",
  projectId: "todo-list-web-1",
  storageBucket: "todo-list-web-1.appspot.com",
  messagingSenderId: "624557223587",
  appId: "1:624557223587:web:6713cb745803f2e832d916",
  measurementId: "G-KD40B1J66S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const db = getFirestore(app);

const provider = new GoogleAuthProvider();
const auth = getAuth(app);
// FIREBASE END

const TodoItemInputField = (props) => {
  const [input, setInput] = useState("");

  const onSubmit = () => {
    props.onSubmit(input);
    setInput("");
  }

  return (
    <div>
      <TextField
        id="todo-item-input"
        label="Todo item"
        variant="outlined" 
        value={input} 
        onChange = {(e) => setInput(e.target.value)}
      />
      <Button variant="outlined" onClick={onSubmit}>Submit</Button>
    </div>
  );
};
  
const TodoItem = (props) => {
  const style = props.todoItem.isFinished ? { textDecoration: 'line-through' } : [];
  return (
    <li>
      <span
        style={style} 
        onClick={() => props.onTodoItemClick(props.todoItem)}
      >
        {props.todoItem.todoItemContent}
      </span>
      <Button variant="outlined" onClick={() => props.onRemoveClick(props.todoItem)}>Remove</Button>
    </li>
  );
};

const TodoItemList = (props) => {
  const todoList = props.todoItemList.map((todoItem, index) => {
    return <TodoItem 
      key={todoItem.id} 
      todoItem={todoItem} 
      onTodoItemClick={props.onTodoItemClick} 
      onRemoveClick={props.onRemoveClick}
    />
  });

  return (
    <div>
      <ul>{todoList}</ul>
    </div>
  );
};

const TodoListAppBar = (props) => {
  const loginWithGoogleButton = (
    <Button color="inherit" onClick={() => {
      signInWithRedirect(auth, provider);
    }}>Login with Google</Button>
  );
  const logoutButton = (
    <Button color="inherit" onClick={() => {
      signOut(auth);
    }}>Log out</Button>
  );
  const button = props.currentUser === null ? loginWithGoogleButton : logoutButton;

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Todo List App
        </Typography>
        {button}
      </Toolbar>
    </AppBar>
  );
};
  

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [todoItemList, setTodoItemList] = useState([]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setCurrentUser(user.uid);
    } else {
      setCurrentUser(null);
    }
  });
    

  const syncTodoItemListStateWithFirestore = () => {
    const q = query(collection(db, "todoItem"), where("userId", "==", currentUser), orderBy("createdTime", "desc"));
    getDocs(q).then((querySnapshot) => { // 앱이 처음 켜졌을 때 todoItem을 다 읽어와라
      const firestoreTodoItemList = [];
      querySnapshot.forEach((doc) => {
        firestoreTodoItemList.push({ // 가져온 데이터를 firestoreTodoItemList 이 배열에 넣어서 
          id: doc.id,
          todoItemContent: doc.data().todoItemContent,
          isFinished: doc.data().isFinished,
          createdTime: doc.data().createdTime ?? 0,
          userId: doc.data().userId,
        });
      });
      setTodoItemList(firestoreTodoItemList); // setTodoItemList를 사용해서 todoList를 추가해줘라
    });
  };
    
  useEffect(() => {
    syncTodoItemListStateWithFirestore();
  }, [currentUser]);
    
  // FIREBASE
  const onSubmit = async (newTodoItem) => {
    await addDoc(collection(db, "todoItem"), {
      todoItemContent: newTodoItem,
      isFinished: false,
      createdTime: Math.floor(Date.now() / 1000),
      userId: currentUser,
    });

    syncTodoItemListStateWithFirestore();
  };
    
  const onTodoItemClick = async (clickedTodoItem) => {
    const todoItemRef = doc(db, "todoItem", clickedTodoItem.id);
    await setDoc(todoItemRef, { isFinished: !clickedTodoItem.isFinished }, { merge: true });

    syncTodoItemListStateWithFirestore();
  };

  const onRemoveClick = async (removedTodoItem) => {
    const todoItemRef = doc(db, "todoItem", removedTodoItem.id);
    await deleteDoc(todoItemRef);
    
    syncTodoItemListStateWithFirestore();
  };

  return (
    <div className="App">
      <TodoListAppBar currentUser={currentUser} />
      <TodoItemInputField onSubmit={onSubmit} />
      <TodoItemList 
        todoItemList={todoItemList} 
        onTodoItemClick={onTodoItemClick} 
        onRemoveClick={onRemoveClick}  
      />
    </div>
  );
}

export default App;
