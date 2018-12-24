import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import SignIn from './components/SignIn/SignIn';
import SignUp from './components/SignUp/SignUp';
import Aux from './components/hoc/hocAux';
import Spinner from './components/Spinner/Spinner';
import './App.css';



const app = new Clarifai.App({
  apiKey: '1e54b9db0baf466e8f09fdc2528d54a0'
});

const ParticleOptions = {
  particles: {
    number: {
      value: 80,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
};
class App extends Component {
  state = {
    input: '',
    imageUrl: '',
    box: [],
    route: 'signIn',
    loading: false,
    signedIn: false,
    user: {
      id: '',
      name: '',
      email: '',
      password: '',
      entries: '',
      joined: ''
    }
  }



  onChangeEventHandler = (event) => {
    console.log(event.target.value);
    const url = event.target.value;
    this.setState({ input: url, imageUrl: url });
  }

  calculateFaceLocation = (data) => {
    //console.log(data[0].region_info.bounding_box);
    const boxes = data.map((person) => {
      const clarifaiFace = person.region_info.bounding_box;
      console.log(clarifaiFace);
      const image = document.getElementById('inputimage');
      console.log(image);
      const width = Number(image.width);
      const height = Number(image.height);
      return {
        left: clarifaiFace.left_col * width,
        right: width - (clarifaiFace.right_col * width),
        top: clarifaiFace.top_row * height,
        bottom: height - (clarifaiFace.bottom_row * height)
      }
    });
    return boxes;
  }

  displayFaceBox = (boxes) => {
    console.log(boxes);
    this.setState({ box: boxes, loading: false });
  }

  updateUserEntries = () => {
    console.log(this.state.user.id);
    fetch('https://damp-falls-23580.herokuapp.com/image', {
      method: 'put',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        id: this.state.user.id
      })
    }).then((response) => {
      console.log("response ", response);
      return response.json()
    })
      .then(data => {
        console.log("dataUSER-----------", data);
        if (data.user) {
          this.setState({
            user: data.user,
            loading: false
          })

        }
      }).catch(e => {
        this.setState({ loading: false });
        console.log(e)
      });

  }


  onClickHandler = () => {
    this.setState({ loading: true });
    console.log("click");
    const input = this.state.input;
    this.setState({ imageUrl: input });
    const url = this.state.input;
    app.models.predict("a403429f2ddf4b49b307e318f00e528b", { url }).then((response) => {
      console.log(response);
      const data = response.outputs[0].data.regions;
      this.displayFaceBox(this.calculateFaceLocation(data));
      this.updateUserEntries();
    }).catch((e) => {
      this.setState({ loading: false })
      console.log(e);
    })
  }

  onRouteChange = (newRoute) => {
    console.log("INSIDE FUNCTION  ", newRoute);

    if (newRoute === 'signIn' || newRoute === 'signUp') {
      this.setState({
        route: newRoute,
        signedIn: false
      })
    }
    else if (newRoute === 'home') {
      this.setState(
        {
          signedIn: true,
          route: newRoute
        });
    }
  }

  setUserFunction = (user) => {
    this.setState({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        password: user.password,
        entries: user.entries,
        joined: user.joined
      }
    });
  }





  render() {
    return (
      <div className="App">
        <Particles
          className="particles"
          params={ParticleOptions} />
        <Navigation routeChanger={this.onRouteChange} isSigned={this.state.signedIn}
        />
        {(this.state.route === 'signIn') ?
          <SignIn routeChanger={this.onRouteChange} setUser={this.setUserFunction} />
          : null}
        {(this.state.route === 'signUp') ?
          <SignUp routeChanger={this.onRouteChange} setUser={this.setUserFunction} />
          : null}
        {(this.state.route === 'home') ?
          (<Aux>
            <Logo />
            {(this.state.loading) ? <Spinner /> : null}

            <Rank
              user={this.state.user}
            />
            <ImageLinkForm
              onChangeEvent={this.onChangeEventHandler}
              onClickEvent={this.onClickHandler}
            />
            <FaceRecognition box={this.state.box} url={this.state.imageUrl} />
          </Aux>)
          : null}</div>
    );
  }
}

export default App;
