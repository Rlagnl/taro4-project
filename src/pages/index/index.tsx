import { View, Text } from "@tarojs/components";
import { AtButton } from "taro-ui";
import { FC, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import useStore from "@/store";

import "taro-ui/dist/style/components/button.scss"; // 按需引入
import "./index.scss";

interface IIndexProps {
  children?: React.ReactNode;
}

const Index: FC<IIndexProps> = (props) => {
  const { bears, increasePopulation } = useStore(
    useShallow((state) => ({
      bears: state.bears,
      increasePopulation: state.increasePopulation,
    })),
  );

  return (
    <View className='<%= pageName %>'>
      <Text>Hello world!</Text>
      <AtButton type='primary'>I need Taro UI</AtButton>
      <Text>Taro UI 支持 Vue 了吗？</Text>
      <AtButton type='primary' circle>
        支持
      </AtButton>
      <Text>共建？</Text>
      <AtButton type='secondary' circle onClick={increasePopulation}>
        click +1
      </AtButton>
      <Text>bears: {bears}</Text>
    </View>
  );
};

export default Index;
