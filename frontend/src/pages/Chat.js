import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getChatHistory, sendMessage, getChatUsers, updateMessageReadStatus, getUnreadMessageCount } from '../api/chatApi';
import { getUserInfo, searchUsers } from '../api/userApi';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 状态管理
  const [chatUsers, setChatUsers] = useState([]); // 对话用户列表
  const [selectedUser, setSelectedUser] = useState(null); // 选中的对话用户
  const [chatHistory, setChatHistory] = useState([]); // 对话记录
  const [message, setMessage] = useState(''); // 输入的消息
  const [loading, setLoading] = useState(false); // 加载状态
  const [error, setError] = useState(''); // 错误信息
  const [searchKeyword, setSearchKeyword] = useState(''); // 搜索关键词
  const [searchResults, setSearchResults] = useState([]); // 搜索结果
  const [unreadCounts, setUnreadCounts] = useState({}); // 各用户未读消息数量
  
  // 检查用户是否已登录
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  // 初始化对话用户列表
  useEffect(() => {
    if (user) {
      fetchChatUsers();
      fetchUnreadCounts();
    }
  }, [user]);
  
  // 处理URL参数中的userId，自动选择用户进行对话
  useEffect(() => {
    if (user) {
      const userId = searchParams.get('userId');
      if (userId && !selectedUser) {
        // 获取用户信息并选择该用户进行对话
        const fetchUserAndSelect = async () => {
          try {
            const response = await getUserInfo(userId);
            if (response.code === 200) {
              await startChatWithUser(response.data);
            }
          } catch (err) {
            console.error('获取用户信息失败:', err);
          }
        };
        fetchUserAndSelect();
      }
    }
  }, [user, searchParams, selectedUser]);
  
  // 获取对话用户列表
  const fetchChatUsers = async () => {
    try {
      const response = await getChatUsers(user.id);
      if (response.code === 200) {
        const userIds = response.data;
        const users = await Promise.all(
          userIds.map(async (userId) => {
            const userResponse = await getUserInfo(userId);
            return userResponse.data;
          })
        );
        // 过滤掉null或undefined的用户信息
        const validUsers = users.filter(user => user !== null && user !== undefined);
        setChatUsers(validUsers);
      }
    } catch (err) {
      console.error('获取对话用户列表失败:', err);
      setError('获取对话用户列表失败');
    }
  };
  
  // 获取未读消息数量
  const fetchUnreadCounts = async () => {
    try {
      const response = await getUnreadMessageCount(user.id);
      if (response.code === 200) {
        setUnreadCounts(prev => ({
          ...prev,
          total: response.data
        }));
      }
    } catch (err) {
      console.error('获取未读消息数量失败:', err);
    }
  };
  
  // 选择对话用户
  const selectUser = async (chatUser) => {
    setSelectedUser(chatUser);
    setLoading(true);
    try {
      // 获取对话记录
      const response = await getChatHistory(user.id, chatUser.id);
      if (response.code === 200) {
        setChatHistory(response.data);
        // 更新消息为已读
        await updateMessageReadStatus(chatUser.id, user.id);
        // 更新未读消息数量
        fetchUnreadCounts();
      }
    } catch (err) {
      console.error('获取对话记录失败:', err);
      setError('获取对话记录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 发送消息
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;
    
    try {
      const messageData = {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: message
      };
      
      const response = await sendMessage(messageData);
      if (response.code === 200) {
        // 更新对话记录
        const newMessage = {
          ...messageData,
          id: Date.now(),
          readStatus: 0,
          createTime: new Date().toISOString()
        };
        setChatHistory([...chatHistory, newMessage]);
        setMessage('');
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      setError('发送消息失败');
    }
  };
  
  // 搜索用户
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword.trim()) return;
    
    try {
      const response = await searchUsers('username', searchKeyword);
      if (response.code === 200) {
        // 过滤掉当前用户自己
        const filteredUsers = response.data.filter(u => u.id !== user.id);
        setSearchResults(filteredUsers);
      }
    } catch (err) {
      console.error('搜索用户失败:', err);
      setError('搜索用户失败');
    }
  };
  
  // 从搜索结果中选择用户开始对话
  const startChatWithUser = async (chatUser) => {
    setSelectedUser(chatUser);
    setLoading(true);
    try {
      // 检查是否已有对话记录
      const response = await getChatHistory(user.id, chatUser.id);
      if (response.code === 200) {
        setChatHistory(response.data);
        // 更新消息为已读
        await updateMessageReadStatus(chatUser.id, user.id);
        // 更新未读消息数量
        fetchUnreadCounts();
      }
    } catch (err) {
      console.error('获取对话记录失败:', err);
      setError('获取对话记录失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 如果用户未登录，不渲染组件
  if (!user) {
    return null;
  }
  
  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h2>我的对话</h2>
          <div className="unread-badge" style={{ display: unreadCounts.total > 0 ? 'block' : 'none' }}>
            {unreadCounts.total}
          </div>
        </div>
        
        {/* 搜索用户 */}
        <div className="chat-search">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="搜索用户名"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <button type="submit">搜索</button>
          </form>
          
          {/* 搜索结果 */}
          {searchResults.length > 0 && (
            <div className="search-results">
              <h3>搜索结果</h3>
              {searchResults.filter(result => result !== null && result !== undefined).map((result) => (
                <div key={result.id} className="search-result-item" onClick={() => startChatWithUser(result)}>
                  <img src={result.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg'} alt={result.username} className="user-avatar" />
                  <div className="user-info">
                    <div className="username">{result.username}</div>
                    <div className="user-type">
                      {result.userType === 2 ? '管理员' : result.userType === 1 ? '商家' : '普通用户'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* 对话用户列表 */}
        <div className="chat-users-list">
          {chatUsers.filter(chatUser => chatUser !== null && chatUser !== undefined).map((chatUser) => (
            <div 
              key={chatUser.id} 
              className={`chat-user-item ${selectedUser?.id === chatUser.id ? 'active' : ''}`}
              onClick={() => selectUser(chatUser)}
            >
              <img src={chatUser.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg'} alt={chatUser.username} className="user-avatar" />
              <div className="user-info">
                <div className="username">{chatUser.username}</div>
                <div className="user-type">
                  {chatUser.userType === 2 ? '管理员' : chatUser.userType === 1 ? '商家' : '普通用户'}
                </div>
              </div>
              {unreadCounts[chatUser.id] > 0 && (
                <div className="unread-badge">{unreadCounts[chatUser.id]}</div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* 聊天窗口 */}
      <div className="chat-main">
        {selectedUser ? (
          <>
            {/* 聊天窗口头部 */}
            <div className="chat-main-header">
              <div className="selected-user-info">
                <img src={selectedUser.profilePicture || 'https://images.pexels.com/photos/34692672/pexels-photo-34692672.jpeg'} alt={selectedUser.username} className="user-avatar" />
                <div className="user-info">
                  <div className="username">{selectedUser.username}</div>
                  <div className="user-type">
                    {selectedUser.userType === 2 ? '管理员' : selectedUser.userType === 1 ? '商家' : '普通用户'}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setSelectedUser(null)}>退出对话</button>
            </div>
            
            {/* 聊天记录 */}
            <div className="chat-messages">
              {loading ? (
                <div className="loading">加载中...</div>
              ) : (
                chatHistory.filter(msg => msg !== null && msg !== undefined).map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
                  >
                    <img 
                      src={msg.senderId === user.id ? user.profilePicture : selectedUser.profilePicture} 
                      alt={msg.senderId === user.id ? user.username : selectedUser.username} 
                      className="message-avatar"
                    />
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">{new Date(msg.createTime).toLocaleString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* 消息输入框 */}
            <div className="chat-input-area">
              <form onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="输入消息..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                />
                <button type="submit" disabled={loading || !message.trim()}>发送</button>
              </form>
            </div>
          </>
        ) : (
          <div className="no-chat-selected">
            <h3>请选择一个对话用户或搜索用户开始对话</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
