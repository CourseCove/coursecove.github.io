---
title: Blog
layout: base.njk  # optional — if you're using layouts
---

# Blog Posts

<ul>
{% for post in collections.post %}
  <li>
    <a href="{{ post.url }}">{{ post.data.title }}</a>
    - {{ post.date | date("MMMM d, yyyy") }}
  </li>
{% endfor %}
</ul>
