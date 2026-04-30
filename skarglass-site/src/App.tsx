import { MainLayout } from './components/layout/MainLayout';
import { SkarProvider } from './context/BlobContext';
import { AuthProvider } from './context/AuthContext';
import { BlobDisplay } from './components/BlobDisplay';
import { BlobControls } from './components/BlobControls';

export default function App() {
  return (
    <AuthProvider>
      <SkarProvider>
        <MainLayout>
          <div className="flex-1 flex flex-col gap-10">
            {/* Blob Visualization Area */}
            <BlobDisplay />
            
            {/* Controls Area */}
            <BlobControls />
          </div>
        </MainLayout>
      </SkarProvider>
    </AuthProvider>
  );
}
