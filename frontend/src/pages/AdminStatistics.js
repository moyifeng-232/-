import React, { useState, useEffect, useCallback } from 'react';
import { getStatisticsData } from '../api/statisticsApi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

// 注册ChartJS组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminStatistics = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  
  // 状态管理
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statisticsData, setStatisticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 图表数据准备
  const getLineChartData = () => {
    // 生成最近六个月的月份标签
    const monthLabels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = (monthDate.getMonth() + 1) + '月';
      monthLabels.push(monthName);
    }
    
    // 使用模拟数据绘制最近六个月的交易总量趋势图
    // 模拟数据：最近六个月的交易总量
    const mockData = [120, 190, 300, 500, 200, 300];
    
    return {
      labels: monthLabels,
      datasets: [
        {
          label: '交易总量',
          data: mockData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.1,
        },
      ],
    };
  };
  
  const getPieChartData = () => {
    if (!statisticsData || !statisticsData.categoryDistribution) {
      // 默认数据
      return {
        labels: ['手机', '电脑', '平板', '教材', '课外书', '服饰', '家具', '其他'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: [
              'rgba(255, 99, 132, 0.5)',
              'rgba(54, 162, 235, 0.5)',
              'rgba(255, 206, 86, 0.5)',
              'rgba(75, 192, 192, 0.5)',
              'rgba(153, 102, 255, 0.5)',
              'rgba(255, 159, 64, 0.5)',
              'rgba(199, 199, 199, 0.5)',
              'rgba(83, 102, 255, 0.5)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(199, 199, 199, 1)',
              'rgba(83, 102, 255, 1)',
            ],
            borderWidth: 1,
          },
        ],
      };
    }
    
    // 从statisticsData获取实际分类分布数据
    const labels = Object.keys(statisticsData.categoryDistribution);
    const data = Object.values(statisticsData.categoryDistribution);
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(199, 199, 199, 0.5)',
            'rgba(83, 102, 255, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
            'rgba(83, 102, 255, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // 图表配置
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
  };
  
  // 初始化默认日期为本月1日至今日
  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
  }, []);
  
  // 使用useCallback缓存fetchStatisticsData函数，防止每次渲染都重新创建
  const fetchStatisticsData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getStatisticsData(startDate, endDate);
      if (response.code === 200) {
        setStatisticsData(response.data);
      } else {
        setError('获取统计数据失败');
      }
    } catch (err) {
      console.error('获取统计数据失败:', err);
      setError('获取统计数据失败，请检查网络连接');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);
  
  // 当日期变化时，自动获取统计数据
  useEffect(() => {
    if (startDate && endDate) {
      fetchStatisticsData();
    }
  }, [startDate, endDate, fetchStatisticsData]);
  
  // 检查用户是否为管理员
  if (!user || user.userType !== 2) {
    return <div className="not-found">您没有权限访问此页面</div>;
  }
  
  // 处理日期范围查询
  const handleDateRangeChange = (e) => {
    e.preventDefault();
    fetchStatisticsData();
  };
  
  return (
    <div className="admin-statistics">
      <h2>统计与分析</h2>
      
      {/* 日期范围选择 */}
      <div className="date-range-selector">
        <form onSubmit={handleDateRangeChange} className="date-form">
          <div className="date-input-group">
            <label htmlFor="startDate">开始日期：</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="endDate">结束日期：</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
            />
          </div>
          <button type="submit" className="btn-primary">查询</button>
        </form>
      </div>
      
      {/* 加载状态 */}
      {loading ? (
        <div className="loading">加载中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : statisticsData ? (
        <div className="statistics-content">
          {/* 数字卡片 */}
          <div className="stats-cards-row">
            <div className="stat-card">
              <h3>交易总量</h3>
              <p className="stat-value">{statisticsData.totalTransactions}</p>
            </div>
            <div className="stat-card">
              <h3>总交易金额</h3>
              <p className="stat-value">¥{statisticsData.totalAmount.toFixed(2)}</p>
            </div>
            <div className="stat-card">
              <h3>环境效益</h3>
              <p className="stat-value">{statisticsData.environmentalBenefit.toFixed(2)} kg CO₂</p>
            </div>
          </div>
          
          {/* 图表区域 */}
          <div className="charts-container">
            {/* 交易总量折线图 */}
            <div className="chart-section">
              <h3>交易总量趋势</h3>
              <div className="chart-wrapper">
                <Line data={getLineChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: '交易总量趋势' } } }} />
              </div>
            </div>
            
            {/* 热门商品类别饼图 */}
            <div className="chart-section">
              <h3>热门商品类别分布</h3>
              <div className="chart-wrapper">
                <Pie data={getPieChartData()} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, title: { ...chartOptions.plugins.title, text: '热门商品类别分布' } } }} />
              </div>
            </div>
          </div>
          
          {/* 环境效益明细 */}
          <div className="environmental-benefit-section">
            <h3>环境效益明细</h3>
            <table className="benefit-table">
              <thead>
                <tr>
                  <th>品类</th>
                  <th>商品数量</th>
                  <th>减排系数 (kg CO₂/件)</th>
                  <th>减排量 (kg CO₂)</th>
                </tr>
              </thead>
              <tbody>
                {statisticsData.environmentalBenefitDetails.map((item, index) => (
                  <tr key={index}>
                    <td>{item.categoryName}</td>
                    <td>{item.productCount}</td>
                    <td>{item.coefficient}</td>
                    <td>{item.reduction.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td>总计</td>
                  <td>{statisticsData.environmentalBenefitDetails.reduce((sum, item) => sum + item.productCount, 0)}</td>
                  <td>-</td>
                  <td>{statisticsData.environmentalBenefit.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminStatistics;