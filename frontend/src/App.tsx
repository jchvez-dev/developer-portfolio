import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Landing } from './features/landing';
import { StudioPage } from './features/studio';
import { NotFound } from './features/not-found';

const App = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route index element={<Landing />} />
      <Route path="studio" element={<StudioPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
);

export default App;
