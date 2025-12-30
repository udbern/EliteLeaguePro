export default {
  name: 'news',
  title: 'News',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required().min(10).max(120)
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required()
    },
    {
      name: 'content',
      title: 'Full News Content',
      type: 'array',
      of: [{ type: 'block' }],
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Transfer', value: 'transfer' },
          { title: 'Match', value: 'match' },
          { title: 'Injury', value: 'injury' },
          { title: 'Other', value: 'other' },
        ],
        layout: 'radio'
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'published_at',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: Rule => Rule.required()
    }
  ],
  preview: {
    select: {
      title: 'title',
      media: 'thumbnail',
      content: 'content'
    },
    prepare({ title, media, content }) {
      let text = ''
      if (content) {
        const firstBlock = content.find(block => block._type === 'block')
        if (firstBlock) text = firstBlock.children.map(child => child.text).join(' ')
      }

      return {
        title,
        media,
        subtitle: text ? text.substring(0, 120) + '…' : 'No content yet'
      }
    }
  }
}
