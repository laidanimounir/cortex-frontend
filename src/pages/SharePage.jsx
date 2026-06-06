import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { supabase } from '../lib/supabase';

function SharePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setError('Sharing is not configured');
      return;
    }
    (async () => {
      const { data: row, error: err } = await supabase
        .from('shared_conversations')
        .select('*')
        .eq('id', id)
        .single();
      if (err) {
        setError('Conversation not found');
      } else {
        setData(row);
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="share-page-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="share-page-loading">Loading...</div>;
  }

  return (
    <div className="share-page">
      <div className="share-page-header">
        <h1>{data.title}</h1>
        <span className="share-page-date">
          {new Date(data.created_at).toLocaleDateString()}
        </span>
      </div>
      <div className="share-page-messages">
        {(data.messages || []).map((msg, i) => (
          <div key={i} className={`share-msg ${msg.type === 'user' ? 'share-msg-user' : 'share-msg-bot'}`}>
            <div className="share-msg-label">
              {msg.type === 'user' ? 'You' : 'Cortex'}
            </div>
            <div className="share-msg-content">
              {msg.isImage ? (
                <img src={msg.text} alt="" className="share-image" />
              ) : (
                <ReactMarkdown rehypePlugins={[rehypeHighlight, rehypeRaw]}>
                  {msg.text}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SharePage;
