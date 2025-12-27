import React, { useState, useEffect } from 'react';
import { getProductList } from '../api/productApi';
import { getLevelOneCategories, getCategoriesByParentId } from '../api/categoryApi';
import { Link } from 'react-router-dom';

// 分类项组件
const CategoryItem = ({ category, selectedCategory, setSelectedCategory, fetchSubcategories, expandedCategories, toggleExpand }) => {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubcategories, setHasSubcategories] = useState(false);

  // 检查并获取子分类
  useEffect(() => {
    const checkSubcategories = async () => {
      if (expandedCategories.includes(category.id)) {
        setLoading(true);
        try {
          const response = await getCategoriesByParentId(category.id);
          if (response.code === 200) {
            setSubcategories(response.data);
            setHasSubcategories(response.data.length > 0);
          }
        } catch (err) {
          console.error('获取子分类失败:', err);
        } finally {
          setLoading(false);
        }
      }
    };
    checkSubcategories();
  }, [category.id, expandedCategories]);

  return (
    <li className="category-item">
      <div 
        className={`category-header ${selectedCategory === category.id ? 'active' : ''}`}
        onClick={() => {
          setSelectedCategory(category.id);
          toggleExpand(category.id);
        }}
      >
        <span className="category-name">{category.name}</span>
        {hasSubcategories && (
          <span className={`expand-icon ${expandedCategories.includes(category.id) ? 'expanded' : ''}`}>
            {expandedCategories.includes(category.id) ? '▼' : '▶'}
          </span>
        )}
      </div>
      
      {expandedCategories.includes(category.id) && (
        <ul className="subcategory-list">
          {loading ? (
            <li className="loading">加载中...</li>
          ) : (
            subcategories.map(subcategory => (
              <CategoryItem
                key={subcategory.id}
                category={subcategory}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                expandedCategories={expandedCategories}
                toggleExpand={toggleExpand}
              />
            ))
          )}
        </ul>
      )}
    </li>
  );
};

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(12); // 每页显示12个商品（3行×4列）
  const [loading, setLoading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState([]); // 展开的分类ID数组
  
  // 分页信息
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  // 获取商品列表
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await getProductList({
        categoryId: selectedCategory,
        keyword,
        page,
        size
      });
      if (response.code === 200) {
        // 更新商品列表
        setProducts(response.data.records);
        // 更新分页信息
        setTotal(response.data.total);
        // 确保pages至少为1，避免显示“共0页”
        setPages(Math.max(1, response.data.pages));
        setHasNext(response.data.hasNext);
        setHasPrevious(response.data.hasPrevious);
      }
    } catch (err) {
      console.error('获取商品列表失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 获取一级分类
  const fetchCategories = async () => {
    try {
      const response = await getLevelOneCategories();
      if (response.code === 200) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  // 切换分类展开状态
  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, page, size]);

  const handleSearch = () => {
    setPage(1);
    fetchProducts();
  };

  return (
    <div className="product-list-container">
      <div className="product-list-header">
        <h2>商品列表</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="搜索商品..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>搜索</button>
        </div>
      </div>
      
      <div className="product-list-content">
        {/* 分类筛选 */}
        <div className="category-filter">
          <h3>商品分类</h3>
          <ul className="category-tree">
            <li
              className={`category-item ${selectedCategory === null ? 'active' : ''}`}
              onClick={() => setSelectedCategory(null)}
            >
              <div className="category-header">全部</div>
            </li>
            {categories.map(category => (
              <CategoryItem
                key={category.id}
                category={category}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                expandedCategories={expandedCategories}
                toggleExpand={toggleExpand}
              />
            ))}
          </ul>
        </div>
        
        {/* 商品列表 */}
        <div className="products-grid">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            products.map(product => (
              <div className="product-card" key={product.id}>
                <Link to={`/product/${product.id}`}>
                  <div className="product-image">
                    {/* 假设imageUrls是JSON字符串，需要解析 */}
                    {product.imageUrls && JSON.parse(product.imageUrls).length > 0 ? (
                      <img 
                        src={JSON.parse(product.imageUrls)[0]} 
                        alt={product.title} 
                      />
                    ) : (
                      <div className="no-image">暂无图片</div>
                    )}
                    {/* 已售出标签 */}
                    {product.status === 3 && (
                      <div className="sold-out-badge">已售出</div>
                    )}
                  </div>
                  <div className="product-info">
                    <h4>{product.title}</h4>
                    <p className="product-price">¥{product.price.toFixed(2)}</p>
                    {/* 已售出标签移到图片上，这里不再显示 */}
                  </div>
                </Link>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* 分页 */}
      <div className="pagination">
        <button 
          disabled={!hasPrevious} 
          onClick={() => setPage(prev => Math.max(1, prev - 1))}
        >
          上一页
        </button>
        <span>第 {page} 页/共 {pages} 页</span>
        <button 
          disabled={!hasNext} 
          onClick={() => setPage(prev => prev + 1)}
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default ProductList;