// App.tsx
import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';

class ErrorBoundary extends React.Component<any, { hasError: boolean; error?: any; info?: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: undefined, info: undefined };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary caught:', error, info);
    this.setState({ error, info });
  }
  render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={{flex:1, padding:16, justifyContent:'center', alignItems:'center'}}>
          <Text style={{fontSize:18,fontWeight:'700', marginBottom:8}}>UI Error (caught)</Text>
          <Text selectable style={{color:'#b00020'}}>{String(this.state.error)}</Text>
          <Text selectable style={{marginTop:12}}>{this.state.info ? JSON.stringify(this.state.info, null, 2) : ''}</Text>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppNavigator />
    </ErrorBoundary>
  );
}
