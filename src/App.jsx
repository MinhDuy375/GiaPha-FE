import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:5082/weatherforecast')
      .then(res => setData(res.data))
      .catch(err => console.error('Lỗi gọi API:', err));
  }, []);

  return (
    <div>
      <h1>Kết nối Backend thử nghiệm</h1>
      {data ? <pre>{JSON.stringify(data, null, 2)}</pre> : <p>Đang tải...</p>}
    </div>
  );
}

export default App;