const Schemas = module.exports;

Schemas.digitsStringSchema = {
  type: 'string',
  pattern: '\\d+',
};

Schemas.paginationSchema = {
  type: 'object',
  properties: {
    page: this.digitsStringSchema,
    per_page: this.digitsStringSchema,
  },
  additionalProperties: false,
};
