import { BaseRepository } from '../core/BaseRepository.js';

export class ExampleRepository extends BaseRepository {
  constructor() {
    super('examples');
  }

  /**
   * Encuentra registros que coincidan con las condiciones
   * @param {Object} conditions - Condiciones de búsqueda
   * @param {Object} options - Opciones de paginación
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async findWhere(conditions, options = {}) {
    const { page = 1, pageSize = 10 } = options;
    
    // Generar datos de ejemplo
    const mockData = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `Example ${i + 1}`,
      email: `example${i + 1}@test.com`,
      status: i % 2 === 0 ? 'active' : 'inactive',
      description: `Description ${i + 1}`
    }));

    // Aplicar condiciones de filtrado si existen
    let filteredData = mockData;
    if (conditions) {
      filteredData = mockData.filter(item => {
        return Object.entries(conditions).every(([key, value]) => item[key] === value);
      });
    }

    // Calcular paginación
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = filteredData.slice(start, end);

    return {
      data,
      pagination: {
        total: filteredData.length,
        page,
        pageSize,
        totalPages: Math.ceil(filteredData.length / pageSize)
      }
    };
  }

  /**
   * Encuentra registros paginados
   * @param {number} page - Número de página
   * @param {number} pageSize - Registros por página
   * @returns {Promise<{data: Array, pagination: Object}>}
   */
  async findPaginated(page, pageSize) {
    try {
      const total = 100;
      const totalPages = Math.ceil(total / pageSize);
      const start = (page - 1) * pageSize;
      
      const data = Array.from({ length: pageSize }, (_, i) => ({
        id: start + i + 1,
        name: `Example ${start + i + 1}`,
        email: `example${start + i + 1}@example.com`,
        status: i % 2 === 0 ? 'Active' : 'Inactive',
        description: `Description ${start + i + 1}`
      })).filter((_, index) => start + index < total);

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages
        }
      };
    } catch (error) {
      console.error('Repository Error:', error);
      throw error;
    }
  }
} 