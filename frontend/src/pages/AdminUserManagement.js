import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../api/userApi';

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
  useEffect(() => {
    // 如果不是管理员，不执行获取用户列表的逻辑
    if (!user || user.userType !== 2) {
      setLoading(false);
      return;
    }
    const fetchUsers = async () => {
      try {
        // 调用后端API获取所有用户列表
        const response = await getAllUsers();
        if (response && response.code === 200) {
          setUsers(response.data);
        } else {
          throw new Error(response.message || '获取用户列表失败');
        }
        setLoading(false);
      } catch (err) {
        console.error('获取用户列表失败:', err);
        setError('获取用户列表失败，请稍后重试');
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user]);
  
  // 处理封号/解封
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 2 : 1;
      // 调用后端API更新用户状态
      const response = await updateUserStatus(userId, newStatus);
      if (response && response.code === 200) {
        // 更新本地状态
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.id === userId ? { ...user, status: newStatus } : user
          )
        );
        // 显示操作结果
        const action = newStatus === 2 ? '封号' : '解封';
        alert(`用户${action}成功`);
      } else {
        throw new Error(response.message || '操作失败');
      }
    } catch (err) {
      console.error('更新用户状态失败:', err);
      alert('操作失败，请稍后重试');
    }
  };
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  return (
    <div className="admin-user-management">
      <h2>用户管理</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading ? (
        <div className="loading">加载中...</div>
      ) : (
        <div className="user-table-container">
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
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement;