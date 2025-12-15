interface LoadingScreenProps {
  message?: string
  subMessage?: string
}

const LoadingScreen = ({
  message = "Loading Data",
  subMessage = "Please wait while we fetch your data..."
}: LoadingScreenProps) => {
  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ 
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        background: 'linear-gradient(135deg, #561c24 0%, #6D2932 30%, #7a3540 50%, #6D2932 70%, #561c24 100%)'
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-red-900/10 via-transparent to-red-950/15 pointer-events-none" />
      
      <div className="flex flex-col items-center space-y-8 relative z-10">
        {/* Loading Dots */}
        <div className="flex space-x-3">
          <div 
            className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg animate-bounce"
            style={{ animationDelay: '0s', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg animate-bounce"
            style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}
          ></div>
          <div 
            className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg animate-bounce"
            style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}
          ></div>
        </div>
        
        {/* Loading Text */}
        <div className="text-center space-y-3 px-8">
          <h3 className="text-2xl font-semibold bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 bg-clip-text text-transparent">
            {message}
          </h3>
          <p className="text-amber-200/70 text-sm font-medium">{subMessage}</p>
        </div>
        
        {/* Progress Bar (Optional) */}
        <div className="w-64 h-1 bg-amber-950/40 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen