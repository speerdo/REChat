'use client';
import Image from 'next/image';
import { useChat } from 'ai/react';
import { Message } from 'ai';
import LoadingBubble from './components/LoadingBubble';
import Bubble from './components/Bubble';
import PromptSuggestionsRow from './components/PromptSuggestionsRow';

const Home = () => {
  const { append, isLoading, messages, input, handleInputChange, handleSubmit } = useChat();

  const noMessages = false;
  
  return (
    <main>
      <div className='main-container'>
        <Image src='/assets/re-logo.png' alt="RE Chat logo" width={100} height={100} />
        <section className={`${noMessages ? '' : 'populated'}`}>
          {noMessages ? (
            <>
              <p className='starter-text'>The Ultimate Real Estate Chatbot for Hamilton County, Indiana.</p>
              <br/>
              <PromptSuggestionsRow />
            </>
          ) : (
            <>              
              {messages.map((message, index) => (
                <Bubble key={`message-${index}`} message={message} />
              ))}
              {isLoading && <LoadingBubble />}
            </>
          )}
        </section>
        <form onSubmit={handleSubmit}>
          <input
            className='chat-input p-2 rounded-md'
            value={input}
            onChange={handleInputChange}
            placeholder='Ask me anything about Real Estate in Hamilton County, Indiana.'
          />
          <button type='submit'>Send</button>
        </form>
      </div>
    </main>
  )
}

export default Home;
