using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.Models;
using Backend.DTOs;
using Backend.Middleware;

namespace Backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuscripcionController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<SuscripcionController> _logger;

        public SuscripcionController(ApplicationDbContext context, ILogger<SuscripcionController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Suscripcion>>> GetSuscripciones()
        {
            try
            {
                var userId = GetUserId();
                _logger.LogInformation($"Obteniendo suscripciones para el usuario {userId}");

                var suscripciones = await _context.Suscripciones
                    .Where(s => s.UsuarioId == userId)
                    .ToListAsync();

                return Ok(suscripciones);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener suscripciones para el usuario {UserId}", GetUserId());
                return StatusCode(500, new { message = "Error interno al obtener las suscripciones", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<Suscripcion>> CreateSuscripcion(SuscripcionDTO suscripcionDto)
        {
            try
            {
                var userId = GetUserId();
                _logger.LogInformation($"Creando suscripción para el usuario {userId}");

                var suscripcion = new Suscripcion
                {
                    UsuarioId = userId,
                    Nombre = suscripcionDto.Nombre,
                    Precio = suscripcionDto.Precio,
                    TipoServicio = suscripcionDto.TipoServicio,
                    FechaInicio = DateTime.UtcNow,
                    Activa = true,
                    CicloCobro = suscripcionDto.CicloCobro
                };

                _context.Suscripciones.Add(suscripcion);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetSuscripcion), new { id = suscripcion.Id }, suscripcion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al crear suscripción para el usuario {UserId}", GetUserId());
                return StatusCode(500, new { message = "Error interno al crear la suscripción", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Suscripcion>> GetSuscripcion(int id)
        {
            try
            {
                var userId = GetUserId();
                var suscripcion = await _context.Suscripciones
                    .FirstOrDefaultAsync(s => s.Id == id && s.UsuarioId == userId);

                if (suscripcion == null)
                    return NotFound(new { message = "Suscripción no encontrada" });

                return Ok(suscripcion);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al obtener suscripción {Id} para el usuario {UserId}", id, GetUserId());
                return StatusCode(500, new { message = "Error interno al obtener la suscripción", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSuscripcion(int id)
        {
            try
            {
                var userId = GetUserId();
                var suscripcion = await _context.Suscripciones
                    .FirstOrDefaultAsync(s => s.Id == id && s.UsuarioId == userId);

                if (suscripcion == null)
                    return NotFound(new { message = "Suscripción no encontrada" });

                _context.Suscripciones.Remove(suscripcion);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Suscripción eliminada correctamente" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al eliminar suscripción {Id} para el usuario {UserId}", id, GetUserId());
                return StatusCode(500, new { message = "Error interno al eliminar la suscripción", error = ex.Message });
            }
        }

        private int GetUserId()
        {
            if (HttpContext.Items["UserId"] is int userId)
            {
                return userId;
            }

            _logger.LogError("UserId no encontrado en HttpContext.");
            throw new UnauthorizedAccessException("Usuario no autenticado.");
        }
    }
}
