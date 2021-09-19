import { App, List, View, FormView, Page, ListView } from '../lib/flatout.js';

var groups = new List([
    {
      id: 'group1',
      name: 'Group 1'
    },
    {
      id: 'group2',
      name: 'Group 2'
    }
  ]);


class Root extends View {
  constructor() {
    super(document.body, { container: 'contentBox' });
  }

  title(s) {
    return  s ? `${s} | Top` : 'Top';
  }
}

class Home extends Page {
  title() {
    return 'Top';
  }

  html() {
    return `\
    <div>
     <h2>Top page</h2>
     <nav>
      <a href="/groups">groups</a>
      <a href="/groups/">groups/</a>
     </nav>
    </div>`
  }
}

class GroupListItem extends View {
  html(data) {
    return `<li><a href="/groups/${data.id}">${data.name}</a></li>`
  }
}

class GroupList extends Page {
  title() {
    return 'Groups';
  }

  html(data) {
    return `\
    <section>
     <h1>Group List</h1>
     <ul data-id="groupList1"></ul>
     <ul data-id="groupList2"></ul>
     <div>
      <button data-id="moreButton">More</button>
     </div>
    </section>`
  }

  load(views) {
    views.groupList1 = new ListView(GroupListItem, { data: groups });
    views.groupList2 = new ListView(GroupListItem, { data: groups });
  }

  handle(evts) {
    evts.moreButton_click = (sender, e) => {
      this.loadMore();
    }
  }

  loadMore() {
    var nextId = groups.length + 1;
    groups.add({
      id: 'group' + nextId,
      name: 'Added Group ' + nextId
    });
  }
}

class GroupDetail extends Page {
  title() {
    return 'Group' + this.data.name;
  }

  prepareData() {
    return groups.find('id', this.context.groupId) || {};
  }

  html(data) {
    return `\
    <div>
     <nav>
      <a href="../groups">Group list</a>
     </nav>
     <h1>${data.name}</h1>
     <p>This is a list.</p>
    </div>`
  }
}


App.activate(Root, {
  index: Home,
  groups: {
    index: GroupList,
    ':groupId': {
      index: GroupDetail
    }
  }
}, { mode: 'HISTORY' });
