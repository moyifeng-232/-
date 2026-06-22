import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus, searchUsers } from '../api/userApi';
import ConfirmModal from '../components/ConfirmModal';

const AdminUserManagement = () => {
  // 使用useState存储用户信息，避免每次渲染都创建新对象
  const [user, setUser] = useState(() => {
    // 初始加载时从localStorage获取用户信息
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // 搜索相关状态
  const [searchType, setSearchType] = useState('id');
  const [keyword, setKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // 弹窗相关状态
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentUserStatus, setCurrentUserStatus] = useState(1);
  const [actionType, setActionType] = useState('');
  
  // 监听localStorage中用户信息的变化
  useEffect(() => {
    const handleStorageChange = () => {
      const storedUser = localStorage.getItem('user');
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };
    
    // 监听storage事件
    window.addEventListener('storage', handleStorageChange);
    
    // 清理函数
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true);
      // 调用后端API获取所有用户列表
      const response = await getAllUsers();
      if (response && response.code === 200) {
        setUsers(response.data);
        setIsSearching(false);
      } else {
        throw new Error(response.message || '获取用户列表失败');
      }
    } catch (err) {
      console.error('获取用户列表失败:', err);
      setError('获取用户列表失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 搜索用户
  const handleSearch = async () => {
    if (!keyword.trim()) {
      // 如果关键词为空，获取所有用户
      fetchUsers();
      return;
    }
    
    try {
      setLoading(true);
      // 调用后端API搜索用户
      const response = await searchUsers(searchType, keyword.trim());
      if (response && response.code === 200) {
        setUsers(response.data);
        setIsSearching(true);
      } else {
        throw new Error(response.message || '搜索用户失败');
      }
    } catch (err) {
      console.error('搜索用户失败:', err);
      setError('搜索用户失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 初始化获取用户列表
  useEffect(() => {
    // 如果不是管理员，不执行获取用户列表的逻辑
    if (!user || user.userType !== 2) {
      setLoading(false);
      return;
    }
    
    fetchUsers();
  }, [user]);
  
  // 清除搜索，返回全部用户列表
  const handleClearSearch = () => {
    setKeyword('');
    fetchUsers();
  };
  
  // 处理封号/解封按钮点击，显示确认弹窗
  const handleToggleUserStatus = (userId, currentStatus) => {
    setSelectedUserId(userId);
    setCurrentUserStatus(currentStatus);
    const action = currentStatus === 1 ? '封号' : '解封';
    setActionType(action);
    setShowConfirmModal(true);
  };
  
  // 确认封号/解封
  const confirmToggleUserStatus = async () => {
    try {
      const newStatus = currentUserStatus === 1 ? 2 : 1;
      // 调用后端API更新用户状态
      const response = await updateUserStatus(selectedUserId, newStatus);
      if (response && response.code === 200) {
        // 更新本地状态
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === selectedUserId ? { ...user, status: newStatus } : user
          )
        );
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (err) {
      console.error('更新用户状态失败:', err);
      alert('操作失败，请稍后重试');
    } finally {
      setShowConfirmModal(false);
    }
  };
  
  // 取消封号/解封
  const cancelToggleUserStatus = () => {
    setShowConfirmModal(false);
  };
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  return (
    <div className="admin-user-management">
      <h2>用户管理</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* 搜索表单 */}
      <div className="search-container">
        <select 
          className="search-select"
          value={searchType} 
          onChange={(e) => setSearchType(e.target.value)}
        >
          <option value="id">ID</option>
          <option value="username">用户名</option>
          <option value="realName">真实姓名</option>
          <option value="studentId">学号</option>
        </select>
        <input
          type="text"
          className="search-input"
          placeholder="请输入搜索关键词"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button className="btn-search" onClick={handleSearch}>
          搜索
        </button>
        {isSearching && (
          <button className="btn-clear" onClick={handleClearSearch}>
            清除搜索
          </button>
        )}
      </div>
      
      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="user-table-container">
          {users.length === 0 ? (
            <div className="no-results">
              {isSearching ? '未查询到匹配的用户' : '暂无用户数据'}
            </div>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>真实姓名</th>
                  <th>学号</th>
                  <th>手机号</th>
                  <th>邮箱</th>
                  <th>用户类型</th>
                  <th>状态</th>
                  <th>信誉等级</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.realName}</td>
                    <td>{user.studentId}</td>
                    <td>{user.phone}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.userType === 0 ? '普通用户' : 
                       user.userType === 1 ? '商家用户' : '管理员'}
                    </td>
                    <td>
                      <span className={`status-badge ${user.status === 1 ? 'active' : 'inactive'}`}>
                        {user.status === 1 ? '正常' : user.status === 0 ? '待审核' : '已禁用'}
                      </span>
                    </td>
                    <td>{user.creditLevel}</td>
                    <td>
                      {user.userType !== 2 && (
                        <button 
                          className={`btn-action ${user.status === 1 ? 'btn-danger' : 'btn-success'}`}
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                        >
                          {user.status === 1 ? '封号' : '解封'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      
      {/* 封号/解封确认弹窗 */}
      <ConfirmModal
        isVisible={showConfirmModal}
        title={`${actionType}确认`}
        message={`确定要${actionType}该用户吗？`}
        onConfirm={confirmToggleUserStatus}
        onCancel={cancelToggleUserStatus}
        confirmText="确定"
        cancelText="取消"
      />
    </div>
  );
};

export default AdminUserManagement;