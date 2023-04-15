import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Web3 from 'web3';

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [account, setAccount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: uuidv4(),
      content,
    };
    setPosts([...posts, newPost]);
    setContent('');
  };

  const handleDelete = (id) => {
    const updatedPosts = posts.filter((post) => post.id !== id);
    setPosts(updatedPosts);
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const web3 = new Web3(window.ethereum);
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);
      } catch (error) {
        console.error('User denied account access');
      }
    } else {
      console.error('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  };

  return (
    <div className="App">
      <h1>Post</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      {account && <p>Connected account: {account}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="content">content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button type="submit">post</button>
      </form>
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <p>{post.content}</p>
            <button onClick={() => handleDelete(post.id)}>delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
