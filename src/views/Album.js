import React, { Component } from "react";
import { Link } from "react-router-dom";

import "../static/views/Subject.css";

import UserService from "../services/UserService";
import SearchService from "../services/SearchService";
import SubjectService from "../services/SubjectService";
let userService = UserService.getInstance();
let searchService = SearchService.getInstance();
let subjectService = SubjectService.getInstance();

class Album extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayName: null,
      photo: null,
      isLoggedIn: false,
      loaded: 0,
      album: {},
      comments: [],
      comment: "",
      isLiked: false,
      commentLikes: []
    };
  }

  componentDidMount() {
    const callback = res => {
      subjectService
        .findCommentsBySubjectId("album", this.props.match.params.id)
        .then(comments => {
          console.log("get", comments);
          this.setState({
            album: res,
            comments: comments,
            loaded: this.state.loaded + 1
          });
        });
    };
    searchService.getSubject("album", this.props.match.params.id, callback);

    userService.getCurrentUser().then(user => {
      if (user._id !== -1) {
        console.log(user);
        this.setState({
          displayName: user.displayName,
          photo: user.photo,
          isLoggedIn: true,
          loaded: this.state.loaded + 1
        });
        subjectService
          .findSubjectIsLiked("album", this.props.match.params.id)
          .then(res => {
            console.log(res);
            this.setState({
              isLiked: res.isliked,
              loaded: this.state.loaded + 1
            });
          });
        subjectService.findCommentLikesByCurrentUser().then(res => {
          console.log(res);
          this.setState({
            commentLikes: res,
            loaded: this.state.loaded + 1
          });
        });
      }
    });
  }

  componentWillReceiveProps(nextProps) {
    const callback = res => {
      subjectService
        .findCommentsBySubjectId("album", this.props.match.params.id)
        .then(comments => {
          console.log(comments);
          this.setState({ album: res, comments });
        });
    };
    searchService.getSubject("album", this.props.match.params.id, callback);

    if (nextProps.logoutStatus === true) {
      this.setState({
        displayName: null,
        isLoggedIn: false
      });
    }
  }

  onCommentChanged = e => {
    this.setState({
      comment: e.target.value
    });
    console.log(e.target.value);
  };

  onAddClicked = () => {
    const callback = res => {
      console.log(res, "rev");
      this.setState({
        comment: ""
      });
      this.props.history.push("/album/" + this.props.match.params.id);
    }; // to render new reviews
    const subject = {
      _id: this.props.match.params.id,
      type: "album",
      title: this.state.album.name,
      image:
        this.state.album.images.length > 0
          ? this.state.album.images[0].url
          : null
    };
    subjectService
      .addComment(subject, this.state.comment)
      .then(res => callback(res));
  };

  onLikeClicked = () => {
    this.setState({
      isLiked: !this.state.isLiked
    });
    const subject = {
      _id: this.props.match.params.id,
      type: "album",
      title: this.state.album.name,
      image:
        this.state.album.images.length > 0
          ? this.state.album.images[0].url
          : null
    };
    subjectService.likeSubject(subject);
  };

  onCommentLikeClicked = e => {
    const commentId = e.currentTarget.getAttribute("value");
    console.log(commentId);
    subjectService.likeComment(commentId);
    if (this.state.commentLikes.includes(commentId)) {
      this.setState({
        commentLikes: this.state.commentLikes.filter(id => id !== commentId)
      });
      for (var i = 0; i < this.state.comments.length; i++) {
        if (commentId === this.state.comments[i]._id) {
          this.state.comments[i].likeCount--;
        }
      }
    } else {
      this.setState({
        commentLikes: this.state.commentLikes.concat(commentId)
      });
      for (var i = 0; i < this.state.comments.length; i++) {
        if (commentId === this.state.comments[i]._id) {
          this.state.comments[i].likeCount++;
        }
      }
    }
  };

  render() {
    return (
      ((this.state.isLoggedIn === true && this.state.loaded === 4) ||
        (this.state.isLoggedIn === false &&
          [1, 4].includes(this.state.loaded))) && (
        <div className="container-fluid">
          <div
            className="background-image"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(" +
                this.state.album.images[0].url +
                ")"
            }}
          />
          <div className="content subject-content mt-md-5 mt-sm-3">
            <div className="row">
              <div className="col-6">
                <h1 className="title">{this.state.album.name}</h1>
                <div>
                  Artist:{" "}
                  <Link to={`/artist/${this.state.album.artists[0].id}`}>
                    {this.state.album.artists[0].name}
                  </Link>
                </div>
                <div>Released: {this.state.album.release_date}</div>
                <div>Total tracks: {this.state.album.total_tracks}</div>
                <div>Popularity: {this.state.album.popularity}/100</div>
                {this.state.displayName !== null ? (
                  <div className="my-2">
                    <button
                      className="btn btn-light"
                      onClick={this.onLikeClicked}
                    >
                      {this.state.isLiked === true ? (
                        <span style={{ color: "#cc0000" }}>
                          <i className="fas fa-heart" />
                        </span>
                      ) : (
                        <span style={{ color: "black" }}>
                          <i className="far fa-heart" />
                        </span>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <a href="#" data-toggle="modal" data-target="#login">
                      Log in to like
                    </a>
                  </div>
                )}
              </div>
              <div className="col-6 d-none d-md-block">
                <div className="float-right embed-container">
                  <iframe
                    src={
                      "https://embed.spotify.com/?uri=spotify:album:" +
                      this.state.album.id
                    }
                    width="350px"
                    height="350px"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                  />
                </div>
              </div>
            </div>

            <div className="row my-3 d-md-none">
              <div className="col-12">
                <div className="text-center embed-container">
                  <iframe
                    src={
                      "https://embed.spotify.com/?uri=spotify:album:" +
                      this.state.album.id
                    }
                    width="350px"
                    height="350px"
                    frameBorder="0"
                    allowtransparency="true"
                    allow="encrypted-media"
                  />
                </div>
              </div>
            </div>

            <div className="row comments my-5">
              <div className="col">
                <h4>Tracks</h4>
                {this.state.album.tracks.items.map(track => (
                  <div key={track.id}>
                    &middot; <Link to={`/track/${track.id}`}>{track.name}</Link>
                  </div>
                ))}
              </div>
            </div>

            <div className="row comments my-5">
              <div className="col">
                <h4>Comment</h4>

                {this.state.displayName !== null ? (
                  <div className="comment-editor my-3">
                    <div className="row mx-1 my-2">
                      <div className="col-auto align-self-center">
                        <img
                          width="50px"
                          height="50px"
                          src={this.state.photo}
                        />
                      </div>
                      <div className="col">
                        <textarea
                          onChange={this.onCommentChanged}
                          className="form-control"
                          id="commentTextarea"
                          rows="2"
                          placeholder="Add a comment..."
                          value={this.state.comment}
                        />
                      </div>
                    </div>

                    <div className="row mx-1 my-2">
                      <div className="col">
                        <div className="float-right">
                          <button
                            onClick={this.onAddClicked}
                            className="btn btn-light"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <a href="#" data-toggle="modal" data-target="#login">
                      Log in to add a comment
                    </a>
                    <hr className="comment-hr" />
                  </div>
                )}

                <h5>Latest comments</h5>
                {this.state.comments.map((comment, i) => (
                  <div className="comment-list-item" key={i}>
                    <hr className="comment-hr" />

                    <div className="row">
                      <div className="col-auto align-self-center">
                        <img
                          width="40px"
                          height="40px"
                          src={
                            comment.user.photo === null
                              ? "https://northmemorial.com/wp-content/uploads/2016/10/PersonPlaceholder.png"
                              : comment.user.photo
                          }
                        />
                      </div>
                      <div className="col">
                        <Link to={`/user/${comment.user._id}`}>
                          {comment.user.displayName}
                        </Link>
                        : {comment.content}
                        <br />
                        <div className="comment-time">
                          {comment.updatedAt.slice(0, -5).split("T")[0]}
                          &nbsp;
                          {comment.updatedAt.slice(0, -5).split("T")[1]}
                          &nbsp;UTC&nbsp;
                        </div>
                      </div>
                      <div className="col align-self-center">
                        <button
                          className="btn float-right"
                          style={{ fontSize: "18px", color: "white" }}
                          onClick={this.onCommentLikeClicked}
                          value={comment._id}
                        >
                          {comment.likeCount}&nbsp;
                          {this.state.commentLikes.includes(comment._id) ? (
                            <i className="fas fa-thumbs-up" />
                          ) : (
                            <i className="far fa-thumbs-up" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    );
  }
}

export default Album;
