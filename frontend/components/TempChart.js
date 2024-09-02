/*
Temperature Chart for DeviceDataScreen
*/

//-------------------------------- Imports ----------------------------------------------

import { View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

//-------------------------------- Main -------------------------------------------------

const TempChart = ({ dataX, dataY }) => {
  // When no data, avoid error
  if (!dataX || !dataY || dataX.length == 0 || dataY.length == 0) {
    dataX = [0,0,0];
    dataY = [0,0,0];
  }

  const data = {
    // labels: dataX,
    datasets: [
    {
      data: dataY,
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      // strokeWidth: 2 // optional
    }
    ],
    legend: ['Temperature'] // optional
  };
    
  const chartConfig = {
    // backgroundColor: '#e26a00',
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  };

  //------------------------------ Components -------------------------------------------

  return (
    <View>
      <LineChart 
        data={data}
        width={300}
        height={220}
        chartConfig={chartConfig}
      />
    </View>
  );
};

export default TempChart;
