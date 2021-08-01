import * as React from 'react';
import { useState } from '@hookstate/core';
import { TUser, userStore } from 'src/store/user';
import { useRouter } from 'next/router';
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  ButtonGroup,
} from 'reactstrap';
import { TPost } from 'src/type/post';
import axios from '../helper/axios';

const Dashboard: React.FC = () => {
  const user = useState(userStore);
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();
  const [userDB, setUserDB] = React.useState<TUser[]>([]);
  const [allPostsDB, setAllPostsDB] = React.useState<TPost[]>([]);

  React.useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const userDataPaser = JSON.parse(userData);
      user.set(userDataPaser);
    }

    (async () => {
      try {
        setLoading(true);
        const userServer = await axios.get<TUser[]>('/api/users');
        const postServer = await axios.get<TPost[]>('/api/all-post');
        setUserDB(userServer.data);
        setAllPostsDB(postServer.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (!user.get()._id) return (<>Not permission!!</>);

  function logoutFn() {
    localStorage.removeItem('user');
    router.push('/');
    user.set({});
  }

  if (loading) return (<>Loading..</>);

  async function toggleUser(idUser: string) {
    try {
      const userDBById = userDB.findIndex((userItem) => userItem._id === idUser);
      if (userDBById > -1) {
        const newUser = await axios.get<TUser>(`/api/toggle-user/${idUser}`);
        const userClone = [...userDB];
        userClone[userDBById] = newUser.data;
        setUserDB(userClone);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Container>
        <Row>
          <Col md={{ size: 6, offset: 3 }}>
            hello, { user.get().displayName }
          </Col>
          <Col md={{ size: 3 }}>
            <Button onClick={logoutFn}>Logout</Button>
          </Col>
        </Row>

        <Row>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Display name</th>
                  <th>Avatar</th>
                  <th>Email</th>
                  <th>Operator</th>
                </tr>
              </thead>
              <tbody>
                { userDB.map((userItem, ind) => (
                  <tr>
                    <th scope="row">{String(ind)}</th>
                    <td>{ userItem.displayName }</td>
                    <td>
                      <img
                        src={userItem.avatar}
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                        alt={userItem.displayName}
                      />
                    </td>
                    <td>{ userItem.email }</td>
                    <td>
                      <ButtonGroup>
                        <Button onClick={() => toggleUser(userItem._id)}>{userItem.isDisable ? 'Enable' : 'Disable'}
                        </Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                )) }
              </tbody>
            </Table>
          </Col>
        </Row>
        <Row>
          <Col>
            <Table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>ID User post</th>
                  <th>Status</th>
                  <th>Image</th>
                  <th>Width</th>
                  <th>Height</th>
                  <th>Likes</th>
                  <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                { allPostsDB.map((postItem, ind) => (
                  <tr>
                    <th scope="row">{String(ind)}</th>
                    <td>{ postItem.userID }</td>
                    <td>{ postItem.status }</td>
                    <td>
                      <img
                        src={postItem.image}
                        style={{ width: 40, height: 40, objectFit: 'cover' }}
                        alt={postItem.image}
                      />
                    </td>
                    <td>{ postItem.width }</td>
                    <td>{ postItem.height }</td>
                    <td>{ postItem.likes.length }</td>
                    <td>{ postItem.comments.length }
                    </td>
                  </tr>
                )) }
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;
