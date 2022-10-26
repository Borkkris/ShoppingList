import React from 'react';
import { StyleSheet, Text, View, FlatList, Button } from 'react-native';

// required to make firebase work
const firebase = require('firebase');
require('firebase/firestore');

class App extends React.Component {

  constructor(){
    super();
    this.state = {
    lists: [],
    uid: 0,
    loggedInText: 'Please wait, you are getting logged in',
    };
  
    if (!firebase.apps.length){
      firebase.initializeApp({ 
      apiKey: "AIzaSyCbsKvmGKh-GlfzY29R4BMxdwDrbtnL4YA",
      authDomain: "chatapp-be4e3.firebaseapp.com",
      projectId: "chatapp-be4e3",
      storageBucket: "chatapp-be4e3.appspot.com",
      appId: "1:559303932561:web:3b89a322cc5de6a97b9d30",
      messagingSenderId: "559303932561"
    });
    }

    this.refertenceShoppinglistUser = null;
  }

  componentDidMount() {
    this.referenceShoppingLists = firebase
    .firestore()
    .collection('shoppinglists');

    // this.unsubscribe = this.referenceShoppingLists.onSnapshot(this.onCollectionUpdate) // listenbing for updates / new list will instantly be displayed in my application

    // calls the Firebase Auth service for your app
    // an observer that’s called whenever the user's sign-in state changes and returns an unsubscribe() function
    this.authUnsubscribe = firebase.auth().onAuthStateChanged(async (user) => {
        if (!user) {
          await firebase.auth().signInAnonymously();
        }
      
        // update user state (uid) with currently activate user data 
        // user ID, which you’ll want to save along with each list
        this.setState({
          uid: user.uid,
          loggedInText: 'Hello there'
        });

        // create a reference to the active users's documents (shopping list)
        this.referenceShoppinglistUser = firebase
        .firestore()
        .collection('shoppinglists')
        .where("uid", "==", this.state.uid); 

        // listen for collection changes for current user
        this.unsubscribeListUser = this.referenceShoppinglistUser.onSnapshot(this.onCollectionUpdate);
      }
    );
  }

  componentWillUnmount() {
    // stop listening to authentication
    this.authUnsubscribe();
    // stop listening for changes
    this.unsubscribeListUser()
  }

  // Whenever something changes in your “shoppinglists” collection (and, thus, when onSnapshot() is fired), you need to call a function, like this onCollectionUpdate() function. 
  // This function needs to retrieve the current data in your “shoppinglists” collection and store it in your state lists, allowing that data to be rendered in your view
  onCollectionUpdate = (querySnapshot) => {
    const lists = [];
    // go through each document (name and item)
    querySnapshot.forEach((doc) => {
      // get the QueryDocumentSnapshot's data
      let data = doc.data();
      lists.push({
        name: data.name,
        items: data.items.toString(),
      });
    });
    // the empty lists getting updated here
    this.setState({
      lists,
    }); 
  };

  // add a new list to the collection
  addList() {
    this.referenceShoppingLists.add({
      name: 'new TestList',
      items: ['eggs', 'pasta', 'veggies'],
      uid: this.state.uid,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{this.state.loggedInText}</Text>

        <Text style={styles.text}> All Shopping Lists </Text>

        <FlatList 
        // attribute
          data={this.state.lists}
          // renders each item of the list (name and the items)
          renderItem={({ item }) => (
            <Text style={styles.item}> {item.name}: {item.items}
            </Text>
          )}
        />

        <Button 
          
          onPress={() => { this.addList();
          }}
          title='Add something'
          />
        </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 40,     
  },
  item: {
    fontSize: 20,
    color: 'blue',
  },
  text: {
    fontSize: 30,
  },
});

export default App;