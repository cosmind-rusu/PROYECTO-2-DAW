using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransaccionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TransaccionController> _logger;

        public TransaccionController(ApplicationDbContext context, ILogger<TransaccionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transaccion>>> GetTransacciones()
        {
            try
            {
                var userId = GetUserId();
                var transacciones = await _context.Transacciones
                    .Where(t => t.UsuarioId == userId)
                    .OrderByDescending(t => t.Fecha)
                    .ToListAsync();

                return Ok(transacciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener transacciones para el usuario {UserId}", GetUserId());
                return StatusCode(500, new { message = "Error interno al obtener las transacciones", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Transaccion>> CreateTransaccion(TransaccionDTO transaccionDto)
        {
            try
            {
                var transaccion = new Transaccion
                {
                    UsuarioId = GetUserId(),
                    Concepto = transaccionDto.Concepto,
                    Monto = transaccionDto.Monto,
                    Tipo = transaccionDto.Tipo,
                    Categoria = transaccionDto.Categoria,
                    Fecha = transaccionDto.Fecha,
                    Notas = transaccionDto.Notas
                };

                _context.Transacciones.Add(transaccion);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetTransaccion), new { id = transaccion.Id }, transaccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear transacción para el usuario {UserId}", GetUserId());
                return StatusCode(500, new { message = "Error interno al crear la transacción", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Transaccion>> GetTransaccion(int id)
        {
            try
            {
                var userId = GetUserId();
                var transaccion = await _context.Transacciones
                    .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == userId);

                if (transaccion == null)
                    return NotFound(new { message = "Transacción no encontrada" });

                return Ok(transaccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener transacción {Id} para el usuario {UserId}", id, GetUserId());
                return StatusCode(500, new { message = "Error interno al obtener la transacción", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTransaccion(int id, TransaccionDTO transaccionDto)
        {
            try
            {
                var userId = GetUserId();
                var transaccion = await _context.Transacciones
                    .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == userId);

                if (transaccion == null)
                    return NotFound(new { message = "Transacción no encontrada" });

                transaccion.Concepto = transaccionDto.Concepto;
                transaccion.Monto = transaccionDto.Monto;
                transaccion.Tipo = transaccionDto.Tipo;
                transaccion.Categoria = transaccionDto.Categoria;
                transaccion.Fecha = transaccionDto.Fecha;
                transaccion.Notas = transaccionDto.Notas;

                await _context.SaveChangesAsync();
                return Ok(transaccion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al actualizar transacción {Id} para el usuario {UserId}", id, GetUserId());
                return StatusCode(500, new { message = "Error interno al actualizar la transacción", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTransaccion(int id)
        {
            try
            {
                var userId = GetUserId();
                var transaccion = await _context.Transacciones
                    .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == userId);

                if (transaccion == null)
                    return NotFound(new { message = "Transacción no encontrada" });

                _context.Transacciones.Remove(transaccion);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transacción eliminada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar transacción {Id} para el usuario {UserId}", id, GetUserId());
                return StatusCode(500, new { message = "Error interno al eliminar la transacción", error = ex.Message });
            }
        }

        // Endpoints adicionales específicos para transacciones
        [HttpGet("resumen")]
        public async Task<ActionResult> GetResumenTransacciones()
        {
            try
            {
                var userId = GetUserId();
                var transacciones = await _context.Transacciones
                    .Where(t => t.UsuarioId == userId)
                    .ToListAsync();

                var resumen = new
                {
                    TotalIngresos = transacciones.Where(t => t.Tipo == "Ingreso").Sum(t => t.Monto),
                    TotalGastos = transacciones.Where(t => t.Tipo == "Gasto").Sum(t => t.Monto),
                    Balance = transacciones.Where(t => t.Tipo == "Ingreso").Sum(t => t.Monto) - 
                             transacciones.Where(t => t.Tipo == "Gasto").Sum(t => t.Monto),
                    TransaccionesPorCategoria = transacciones
                        .GroupBy(t => t.Categoria)
                        .Select(g => new
                        {
                            Categoria = g.Key,
                            Total = g.Sum(t => t.Monto)
                        })
                };

                return Ok(resumen);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener resumen de transacciones para el usuario {UserId}", GetUserId());
                return StatusCode(500, new { message = "Error interno al obtener el resumen", error = ex.Message });
            }
        }

        private int GetUserId()
        {
            return (int)HttpContext.Items["UserId"]!;
        }
    }
}