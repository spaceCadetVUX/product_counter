import React, { useState, useEffect,useRef } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, Alert, Modal, StyleSheet , Animated,Easing} from 'react-native';
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/FontAwesome';


// Path to the 'tasks.json' file
const fileUri = FileSystem.documentDirectory + 'tasks.json';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [increaseDisabled, setIncreaseDisabled] = useState(false);
  const [decreaseDisabled, setDecreaseDisabled] = useState(false);


  const [showButtons, setShowButtons] = useState(false); // Controls button visibility
  const rotation = useRef(new Animated.Value(0)).current; // Rotation for arrow icon
  const slideAnim = useRef(new Animated.Value(0)).current; 
  const [showMenu, setShowMenu] = useState(false);



  const rotateInterpolate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [175, 0],
  });

  const toggleAnimations = () => {
    const newShowButtons = !showButtons;
    setShowButtons(newShowButtons);

    if (showButtons) {
      setShowMenu(false);
    }

    Animated.parallel([
      Animated.timing(rotation, {
        toValue: newShowButtons ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),  // Add easing for smoothness
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: newShowButtons ? 1 : 0,
        duration: 300,
        easing: Easing.inOut(Easing.ease),  // Add easing here too
        useNativeDriver: true,  // Enable native driver for better performance
      }),
    ]).start();
  };

  const toggleMenuX = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuOption = (option) => {
    alert(`Selected option: ${option}`);
    setShowMenu(false);
  };

  

  // Load tasks from the tasks.json file
  const loadTasks = async () => {
    try {
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const tasksFromFile = JSON.parse(fileContent);
      setTasks(tasksFromFile);
      setLoading(false);
    } catch (error) {
      console.log('Error reading file:', error);
      setLoading(false);
      setTasks([]); // Initialize with empty tasks array
    }
  };

  // Save tasks to tasks.json
  const saveTasks = async (newTasks) => {
    try {
      const newTasksJson = JSON.stringify(newTasks);
      await FileSystem.writeAsStringAsync(fileUri, newTasksJson);
      console.log('Tasks saved successfully!');
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  };

  // Add a new task
  const addTask = () => {
    if (taskName.trim()) {
      const newTask = {
        id: (tasks.length + 1).toString(), // Generate ID based on current task count
        name: taskName,
        number: 0, // Initialize the task number
      };
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      saveTasks(updatedTasks); // Save updated tasks to the file
      setTaskName(''); // Clear the input field
    }
  };

  // Edit task name
  const editTask = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setCurrentTaskId(id);
      setNewTaskName(task.name); // Set the current task name in the modal
      setModalVisible(true); // Show the modal
    }
  };

  // Save edited task name
  const saveEditedTask = () => {
    if (newTaskName.trim()) {
      const updatedTasks = tasks.map((task) =>
        task.id === currentTaskId ? { ...task, name: newTaskName } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks); // Save updated tasks to the file
      setModalVisible(false); // Close the modal
    }
  };

  // Delete a task
  const deleteTask = (id) => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Delete cancelled'),
      },
      {
        text: 'Delete',
        onPress: () => {
          const updatedTasks = tasks.filter(task => task.id !== id);
          setTasks(updatedTasks);
          saveTasks(updatedTasks);
        },
      },
    ]);
  };
  // Increase task number
  const increaseNumber = (id) => {
    if (!increaseDisabled) {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, number: task.number + 1 } : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks); // Assuming saveTasks is defined elsewhere
    }
  };

  // Decrease task number
  const decreaseNumber = (id) => {
    if (!decreaseDisabled){
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, number: Math.max(task.number - 1, 0) } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }
  };

    // New function to delete all tasks
    const deleteAllTasks = () => { 
      Alert.alert(
        'Delete All Tasks', 
        'Are you sure you want to delete all tasks?', 
        [
          {
            text: 'Cancel',
            onPress: () => console.log('Delete all cancelled'),
          },
          {
            text: 'Delete All',
            onPress: () => {
              setTasks([]);
              saveTasks([]);
              console.log('All tasks deleted');
            },
          },
        ]
      );
    };
    
  // New function to clear values of all tasks
  const clearTaskValues = () => {
    Alert.alert(
      'Clear Task Values',
      'Are you sure you want to clear all task values?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Clear task values cancelled'),
        },
        {
          text: 'Clear All',
          onPress: () => {
            const clearedTasks = tasks.map(task => ({ ...task, number: 0 }));
            setTasks(clearedTasks);
            saveTasks(clearedTasks);
            console.log('All task values cleared');
          },
        },
      ]
    );
  };

 
  
  



  // Conclusion button handler
  const showConclusion = () => {
    const currentDate = new Date().toLocaleDateString();
    const taskList = tasks
      .map((task) => `${task.name}:\t\t${task.number}`)
      .join('\n');
    const message = `Tasks Summary (Date: ${currentDate}):\n\n${taskList}`;
  
    Alert.alert(
      'Task Summary',
      message,
      [
        {
          text: 'Exit',
          onPress: () => console.log('Exit pressed'),
        },
        {
          text: 'Save',
          onPress: () => saveTasks(tasks), // Save the current tasks
        },
      ]
    );
  };
  

  useEffect(() => {
    loadTasks(); // Load tasks when the app starts
  }, []);

  // Render the task list
  const renderItem = ({ item }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskText}>{item.name}</Text>
     

      {/* Show task number */}
      <Text style={styles.numberText}>quantity of goods: <Text style={{fontWeight:'bold',color:'#00224D',fontSize:16}}>{item.number}</Text></Text>

        
      <View style={styles.taskActions}>
        {/* <TouchableOpacity onPress={() => increaseNumber(item.id)} style={[styles.button,{paddingHorizontal:25}]}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity> */}

            {/* Increase Number Button */}
            <TouchableOpacity
                  onPress={() => increaseNumber(item.id)}
                  style={[
                    styles.button,
                    { paddingHorizontal: 25 },
                    increaseDisabled && styles.disabledButton,
                  ]}
                  disabled={increaseDisabled}
                >
                  <Text style={styles.buttonText}>+</Text>
          </TouchableOpacity>


                      {/* Increase Number Button */}
            <TouchableOpacity
                    onPress={() => decreaseNumber(item.id)}
                    style={[
                      styles.button,
                      { paddingHorizontal: 25 },
                      decreaseDisabled && styles.disabledButton,
                    ]}
                    disabled={decreaseDisabled}
                  >
                    <Text style={styles.buttonText}>-</Text>
            </TouchableOpacity>


        <TouchableOpacity onPress={() => editTask(item.id)} style={styles.button}>
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => deleteTask(item.id)} style={[styles.button, {backgroundColor:'red'}]}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    
    <View style={styles.container}>




    <View style={{flex:1}}>
    <Text style={styles.header}>Product Counter</Text>

    {loading ? (
      <Text style={styles.loadingText}>Loading...</Text>
    ) : (
      <FlatList
        data={tasks}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
)}
    </View>



      <View>

      {/* Animated View for buttons */}
      <Animated.View   style={[styles.ctn,
        { transform: [{ translateY: slideInterpolate }] }
        ]}
        >


<TouchableOpacity onPress={toggleAnimations} style={styles.arrowCtn}>
        <Animated.View style={{ transform: [{ rotate: rotateInterpolate }], }}>
          <Icon name="arrow-down" size={25} color="white" />
        </Animated.View>
      </TouchableOpacity> 

          <View style={{padding:35}}></View>

          <TextInput
            value={taskName}
            onChangeText={setTaskName}
            placeholder="Enter product name"
            placeholderTextColor="black"
            style={styles.inputx}
          />

          <View style={styles.buttonCTN}>
                    <TouchableOpacity onPress={addTask} style={styles.conclusionButton}>
                        <Text style={styles.textBtn}>Add Product</Text>
                    </TouchableOpacity>
                    {/* Conclusion Button */}

                    <TouchableOpacity onPress={showConclusion} style={styles.conclusionButton}>
                        <Text style={styles.textBtn}>Conclusion</Text>
                    </TouchableOpacity>

                      <TouchableOpacity onPress={toggleMenuX} style={styles.conclusionButton}>
                        <Text style={styles.textBtn}>{showMenu ? 'Hide Menu' : 'Show Menu'}</Text>
                      </TouchableOpacity>
            </View>


      </Animated.View>
      </View>







      {showMenu && (
        <View style={styles.menu}>
            <View style={{flexDirection:'row',width:'100%',justifyContent:'space-around',alignItems:'center'}}>
                <TouchableOpacity onPress={deleteAllTasks} style={[styles.conclusionButton,{width: 140,backgroundColor:'#A0153E'}]}>
                  <Text style={styles.textBtn}>Delete All Products</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={clearTaskValues} style={[styles.conclusionButton,{width: 140,backgroundColor:'#A0153E'}]}>
                  <Text style={styles.textBtn}>Clear All values</Text>
                </TouchableOpacity>
            </View>

            <View style={{flexDirection:'row',width:'100%',justifyContent:'space-around',alignItems:'center'}}>
              <TouchableOpacity
                  onPress={() => setIncreaseDisabled(!increaseDisabled)}
                  style={[styles.conclusionButton,{width:130, backgroundColor:'#00224D'}]}
                >
                  <Text style={styles.textBtn}>
                    {increaseDisabled ? 'Enable Increase' : 'Disable Increase'}
                  </Text>
              </TouchableOpacity>

              <TouchableOpacity
                  onPress={() => setDecreaseDisabled(!decreaseDisabled)}
                  style={[styles.conclusionButton,{width:130, backgroundColor:'#00224D'}]}
                >
                  <Text style={styles.textBtn}>
                    {decreaseDisabled ? 'Enable Decrease' : 'Disable Decrease'}
                  </Text>
              </TouchableOpacity>
            </View>
        </View>
      )}


      {/* Modal for editing task */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Edit Task Name</Text>
            <TextInput
              style={styles.input}
              value={newTaskName}
              onChangeText={setNewTaskName}
              placeholder="Enter new task name"
            />
            <View style={styles.modalActions}>
              <Button title="Save" onPress={saveEditedTask} />
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Define styles with StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    backgroundColor: '#f4f4f9',
  },
  arrowButton: {
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 20,
    marginBottom: 10,
    justifyContent:'center:',
    alignItems:'center'
  },
  arrowText: {
    fontSize: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#4a90e2',
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
  },
  taskItem: {
    padding: 2,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginHorizontal: 20,
  },
  taskText: {                                                     
    fontSize: 18,
    fontWeight:'bold',
    color: '#A0153E',
  },
  numberText: {
    fontSize: 14,
    fontWeight:'bold',
    color: '#777',
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    paddingVertical: 3,
    paddingHorizontal: 12,
    backgroundColor: '#4a90e2',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
  },
  input: {
    width:200,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    margin: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  conclusionButton: {
    marginTop: 20,
    justifyContent:'center',
    alignItems:'center',
    width:100,
    paddingVertical:18,
    backgroundColor:'#4a90e2',
    borderRadius:20,
    marginBottom:10,
  },
  textBtn:{
    color:'white',
    fontSize:16,
    fontWeight:'bold',
  },
  menu: { 
    width:'100%',
      justifyContent:'center',
      alignItems:'center'
  },
  disabledButton: {
    backgroundColor: 'grey', // Change color for disabled state
  },
  container1:{
    backgroundColor:'transparent',
    width:"100%",
    justifyContent:'center',
    alignItems:'center,'

  },
  buttonContainer: {
    width: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  ctn:{
  
    position:'absolute',
    bottom:0,
    width:"100%",
    alignItems:'center'
    ,justifyContent:'center',
    backgroundColor:'white',
    height:220,

  },
  arrowCtn:{
    position:'absolute',
    top:0,
   
    paddingVertical:10, 
    width:"100%",
    
    backgroundColor:'#4a90e2',  
    justifyContent:'center',
     alignItems:'center',

     
  },
  inputx:{
    backgroundColor: '#fff',
    width:'85%',
    padding: 10,
    marginVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16, // Adjust font size for both text input and placeholder
  
  },
  buttonCTN:{
    flexDirection:'row',
    width:'100%',
    justifyContent:'space-evenly'
  }
});
