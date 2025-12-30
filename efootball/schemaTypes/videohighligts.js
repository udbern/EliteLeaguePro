export default {
  name: 'videoHighlight',
  title: 'Video Highlight',
  type: 'document',

  fields: [
    {
      name: 'fixture',
      title: 'Fixture',
      type: 'reference',
      to: [{ type: 'fixture' }],
      validation: Rule => Rule.required()
    },

    {
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'Example: Chelsea 1–1 Arsenal | Highlights'
    },

    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        slugify: input =>
          input
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .slice(0, 200)
      },
      validation: Rule => Rule.required()
    },

    {
      name: 'video',
      title: 'Video File',
      type: 'file',
      options: { accept: 'video/*' },
      validation: Rule => Rule.required()
    },

    {
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: { hotspot: true },
      description: 'Upload a thumbnail image for the video'
    },

    // Optional but ok to keep
    {
      name: 'published_at',
      title: 'Published At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    }
  ],

  preview: {
    select: {
      title: 'title',
      media: 'video.asset'   // ✅ Shows Mux thumbnail preview
    }
  }
}
