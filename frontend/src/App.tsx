import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './features/landing';
import { StudioPage } from './features/studio';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="studio" element={<StudioPage />} />
    </Route>
  </Routes>
);

export default App;
