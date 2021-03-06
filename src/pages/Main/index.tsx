import { Avatar, Badge, Icon, Layout } from 'antd';
import { computed } from 'mobx';
import { inject, observer } from 'mobx-react';
import React from 'react';
import HeadRoom from 'react-headroom';
import { renderRoutes, RouteConfigComponentProps } from 'react-router-config';
import logoTransUrl from '../../assets/images/logo-trans.png';
import logoUrl from '../../assets/images/logo.svg';
import Loading from '../../components/common/Loading';
import HeaderRoom from '../../components/header/HeaderRoom';
import { ICoursesStore } from '../../stores/Courses';
import { IGlobalStore } from '../../stores/Global';
import { INotificationStore } from '../../stores/Notification';
import { IProfileStore } from '../../stores/Profile';
import { ITodosStore } from '../../stores/Todos';
import styles from './index.module.less';
import { menuRoutes } from './router';

const { Header, Sider, Content } = Layout;

interface IMainProps extends RouteConfigComponentProps<{}> {
  $Global?: IGlobalStore;
  $Profile?: IProfileStore;
  $Courses?: ICoursesStore;
  $Notification?: INotificationStore;
  $Todos?: ITodosStore;
}

@inject('$Global', '$Profile', '$Courses', '$Notification', '$Todos')
@observer
export default class Main extends React.Component<IMainProps> {

  /**
   * When enter the Main layout,
   * Load the basic information including
   * profile, courses...
   */
  async componentDidMount() {
    const { $Profile, $Courses, $Notification, $Todos } = this.props;
    await Promise.all([
      $Profile!.LoadProfileAsync(),
      $Courses!.LoadCoursesAsync(),
      $Notification!.LoadNotificationsAsync({ current: 1, pageSize: 20 }),
      $Todos!.LoadTodosAsync()
    ]);
  }

  componentWillUnmount() {
    const { $Notification } = this.props;
    $Notification!.closeSocket();
  }

  handleToggle = () => {
    this.props.$Global!.toggle();
  }

  @computed
  get Menu() {
    const { $Global } = this.props;
    return (
      <Sider
        breakpoint={ 'md' }
        trigger={ null }
        collapsible={ true }
        collapsed={ $Global!.collapsed }
        className={ styles.sider }
      >
        <div className={ styles.logoWrapper }>
          <img src={ logoTransUrl } alt={ 'logo' } />
        </div>
        { renderRoutes(menuRoutes) }
      </Sider>
    );
  }

  @computed
  get contentLayoutClassNames() {
    const { $Global } = this.props;
    const classNames = [ styles.contentLayout ];
    if ($Global!.collapsed) {
      classNames.push(styles.contentLayoutCollapsed);
    }
    return classNames.join(' ');
  }

  @computed
  get contentHeaderClassNames() {
    const { $Global } = this.props;
    const classNames = [ styles.contentHeader ];
    if ($Global!.collapsed) {
      classNames.push(styles.contentHeaderCollapsed);
    }
    return classNames.join(' ');
  }

  @computed
  get NotificationBell() {
    const { $Notification } = this.props;
    return (
      <span className={ styles.action }>
        <Badge dot={ Boolean($Notification!.unread) }>
          <Icon type={ 'bell' } />
        </Badge>
      </span>
    );
  }

  @computed
  get Header() {
    const { $Global, $Profile } = this.props;
    return (
      <Header className={ this.contentHeaderClassNames }>
        <Icon
          className={ styles.trigger }
          type={ $Global!.collapsed ? 'menu-unfold' : 'menu-fold' }
          onClick={ this.handleToggle }
        />
        <HeaderRoom>
          <span>The Art of Coding</span>
        </HeaderRoom>
        <div className={ styles.right }>
          { this.NotificationBell }
          <span className={ styles.action }>
            <Loading loading={ !$Profile!.profile || $Profile!.$loading.get('LoadProfileAsync') } />
            <Avatar size={ 'large' } icon={ 'user' } src={ $Profile!.avatarUrl } />
          </span>
        </div>
      </Header>
    );
  }

  render() {
    const { route } = this.props;
    return (
      <Layout>
        { this.Menu }
        <Layout className={ this.contentLayoutClassNames }>
          { this.Header }
          <Content className={ styles.content }>
            { renderRoutes(route!.routes) }
          </Content>
        </Layout>
      </Layout>
    );
  }
}
