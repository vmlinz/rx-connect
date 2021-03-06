import React from "react";
import Rx from "rx";
import { rxConnect } from "rx-connect";
import { Link } from "react-router";

import { hashCode, toHex } from "../utils";

import { fetchUser } from "../actions/users";
import { fetchPosts } from "../actions/posts";

@rxConnect((props$, state$, dispatch) => {
    const userId$ = props$.pluck("params", "userId").distinctUntilChanged().shareReplay(1);

    return userId$.flatMapLatest(userId => {
        const user$ = dispatch(fetchUser(userId))
            .catch(Rx.Observable.of(null));

        const postsByUser$ = dispatch(fetchPosts({ userId }))
            .pluck("data")
            .catch(Rx.Observable.of(null));

        // combineLatest to wait until both user and posts arrived to avoid flickering
        return Rx.Observable
            .combineLatest(user$, postsByUser$)
            .startWith([])
            .map(([ user, posts ]) => ({ user, posts }));
    });
})
export default class UserView extends React.PureComponent {

    render() {
        const { user, posts } = this.props;

        if (user === undefined) {
            return <div className="ui loading basic segment" />;
        }

        if (user === null) {
            return <h3>User not found</h3>;
        }

        const {
            name,
            email,
            phone,
            website,
            company: {
                name: companyName,
            },
            address: {
                street,
                suite,
                city,
                zipcode,
            }
        } = user;

        return (
            <div className="main container">
                <div className="ui stackable grid">
                    <div className="row">
                        <h3>{name}</h3>
                    </div>
                    <div className="row">
                        <div className="six wide column">
                            <img src="//placehold.it/240x320&text=[img]" />
                        </div>
                        <div className="ten wide column">
                            <table className="ui very basic table">
                                <tbody>
                                <tr>
                                    <td>Email</td>
                                    <td>{email}</td>
                                </tr>
                                <tr>
                                    <td>Phone</td>
                                    <td>{phone}</td>
                                </tr>
                                <tr>
                                    <td>Website</td>
                                    <td><a href={`//${website}`}>{ website }</a></td>
                                </tr>
                                <tr>
                                    <td>Company</td>
                                    <td>{companyName}</td>
                                </tr>
                                <tr>
                                    <td>Address</td>
                                    <td>{street}, {suite}, {city} {zipcode}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="row">
                        <div className="ui divider" />
                    </div>
                    <div className="row">
                        <h4>Posts by user</h4>
                    </div>

                    <div className="row">
                        { posts && posts.length > 0 ? (
                            <div className="ui very relaxed list">
                                { posts.map(({ id, title }) => (
                                    <div key={ id } className="item">
                                        <img className="ui avatar image" src={`//placehold.it/100x100/${title::hashCode()::toHex()}`} />
                                        <div className="content">
                                            <Link to={`/posts/${id}`} className="header">{title}</Link>
                                            <div className="description">a few days ago</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div>No posts</div>
                        ) }
                    </div>
                </div>


            </div>
        )
    }
}
