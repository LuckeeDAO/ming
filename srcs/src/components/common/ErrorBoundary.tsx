/**
 * 错误边界组件
 * 
 * 功能：
 * - 捕获子组件树中的JavaScript错误
 * - 记录错误信息
 * - 显示友好的错误界面
 * - 提供重试功能
 * 
 * 使用说明：
 * - 包裹可能出错的组件树
 * - 当子组件抛出错误时，会显示错误界面而不是崩溃整个应用
 * 
 * @module components/common/ErrorBoundary
 */

import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';

/**
 * 错误边界组件属性接口
 */
interface Props {
  /**
   * 子组件
   */
  children: ReactNode;
}

/**
 * 错误边界组件状态接口
 */
interface State {
  /**
   * 是否发生错误
   */
  hasError: boolean;
  /**
   * 错误对象
   */
  error: Error | null;
}

/**
 * 错误边界组件类
 * 
 * 使用React错误边界机制捕获和处理错误
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  /**
   * 从错误中派生状态
   * 当子组件抛出错误时调用
   * 
   * @param error - 错误对象
   * @returns 新的状态对象
   */
  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * 捕获错误并记录
   * 
   * @param error - 错误对象
   * @param errorInfo - 错误信息
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  /**
   * 处理重置错误
   * 清除错误状态，允许用户重试
   */
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap={3}
            textAlign="center"
          >
            <Typography variant="h4" component="h1" color="error">
              出现错误
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {this.state.error?.message || '发生了未知错误'}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReset}
            >
              重试
            </Button>
          </Box>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
