import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { publishProduct, uploadImages } from '../api/productApi';
import { getAllCategories, getLevelOneCategories, getCategoriesByParentId } from '../api/categoryApi';

const PublishProduct = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 表单状态
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrls: []
  });
  
  // 分类列表
  const [categories, setCategories] = useState([]);
  // 错误信息
  const [error, setError] = useState('');
  // 成功信息
  const [success, setSuccess] = useState('');
  // 图片预览
  const [imagePreviews, setImagePreviews] = useState([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  
  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategories();
        if (response && response.data) {
          // 只显示二级分类和没有子分类的一级分类（例如"其他"分类）
          const allCategories = response.data;
          // 找出所有有子分类的父分类ID
          const parentCategoryIds = allCategories
            .filter(cat => cat.level === 2)
            .map(cat => cat.parentId);
          
          // 过滤出所有二级分类和没有子分类的一级分类
          const filteredCategories = allCategories.filter(cat => {
            // 如果是二级分类，直接保留
            if (cat.level === 2) {
              return true;
            }
            // 如果是一级分类，且没有子分类，保留（例如"其他"分类）
            if (cat.level === 1) {
              return !parentCategoryIds.includes(cat.id);
            }
            // 其他情况不保留
            return false;
          });
          
          setCategories(filteredCategories);
        }
      } catch (err) {
        console.error('获取分类失败:', err);
        setError('获取分类失败，请稍后重试');
      }
    };
    
    fetchCategories();
  }, []);
  
  // 检查用户是否已登录且是商家
  useEffect(() => {
    if (!user || user.userType !== 1) {
      // 非商家用户或未登录，跳转到首页
      navigate('/');
    }
  }, [user, navigate]);
  
  // 处理表单输入变化
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 处理图片上传
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // 限制最多上传5张图片（包括已上传的）
    if (formData.imageUrls.length + files.length > 5) {
      setError('最多只能上传5张图片');
      return;
    }
    
    setLoading(true);
    try {
      // 调用图片上传API
      const response = await uploadImages(files);
      if (response.code === 200) {
        const uploadedUrls = response.data;
        
        // 生成预览图片URL（本地blob URL用于预览）
        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
        
        // 保存服务器返回的真实图片URL
        setFormData(prev => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...uploadedUrls]
        }));
      } else {
        setError(response.message || '图片上传失败');
      }
    } catch (err) {
      console.error('图片上传失败:', err);
      setError('图片上传失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };
  
  // 移除图片
  const removeImage = (index) => {
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };
  
  // 处理表单提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // 表单验证
    if (!formData.title.trim()) {
      setError('请输入商品名称');
      return;
    }
    
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('请输入有效的商品价格');
      return;
    }
    
    if (!formData.categoryId) {
      setError('请选择商品分类');
      return;
    }
    
    if (formData.imageUrls.length === 0) {
      setError('请至少上传一张商品图片');
      return;
    }
    
    try {
      // 准备提交数据
      const submitData = {
        ...formData,
        userId: user.id,
        price: parseFloat(formData.price),
        imageUrls: JSON.stringify(formData.imageUrls), // 将图片URL数组转为字符串
        status: 1 // 在售状态
      };
      
      // 调用发布商品API
      const response = await publishProduct(submitData);
      
      if (response && response.code === 200) {
        setSuccess('商品发布成功');
        
        // 清空表单
        setFormData({
          title: '',
          description: '',
          price: '',
          categoryId: '',
          imageUrls: []
        });
        setImagePreviews([]);
        
        // 2秒后跳转到已发布页面
        setTimeout(() => {
          navigate('/published');
        }, 2000);
      } else {
        setError(response.message || '商品发布失败，请稍后重试');
      }
    } catch (err) {
      console.error('发布商品失败:', err);
      setError('商品发布失败，请稍后重试');
    }
  };
  
  return (
    <div className="publish-product-container">
      <h2>发布商品</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit} className="publish-form">
        <div className="form-group">
          <label htmlFor="title">商品名称</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="请输入商品名称"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">商品价格</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            placeholder="请输入商品价格"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="categoryId">商品分类</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">请选择分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">商品简介</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="请输入商品简介（非必要）"
            rows={5}
          ></textarea>
        </div>
        
        <div className="form-group">
          <label htmlFor="images">上传图片（最多5张）</label>
          <input
            type="file"
            id="images"
            name="images"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
          />
          
          {/* 图片预览 */}
          {imagePreviews.length > 0 && (
            <div className="image-preview-container">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`预览 ${index + 1}`} />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={() => removeImage(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="publish-btn">发布商品</button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/')}
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishProduct;