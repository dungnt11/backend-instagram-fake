import * as React from 'react';
import {
  Container,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
} from 'reactstrap';
import { useState } from '@hookstate/core';
import { useRouter } from 'next/router';
import { userStore as userStoreOrigin } from 'src/store/user';
import axios from '../helper/axios';

const IndexPage = () => {
  const userStore = useState(userStoreOrigin);
  const [user, setUser] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const router = useRouter();

  async function loginFn() {
    try {
      setLoading(true);
      const res = await axios.post('/api/login', { email: user, password: pass, isAdmin: true });
      userStore.set(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      router.push('/dashboard');
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Container>
        <Row>
          <Col md={{ size: 6, offset: 3 }}>
            <FormGroup>
              <Label for="username">Username</Label>
              <Input
                type="text"
                name="text"
                id="username"
                value={user}
                onChange={({ target }) => setUser(target.value)}
              />
              <Label for="password">Password</Label>
              <Input
                type="password"
                name="text"
                id="password"
                value={pass}
                onChange={({ target }) => setPass(target.value)}
              />
              <br />
              <Button color="primary" onClick={loginFn} disabled={loading}>
                { loading ? 'Loading..' : 'Login' }
              </Button>
            </FormGroup>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default IndexPage;
