// Model: Ahorro.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend.Models
{
    public class Ahorro
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [Required]
        [StringLength(100)]
        public string Nombre { get; set; } = string.Empty;

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal MetaAhorro { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal MontoActual { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime FechaInicio { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? FechaObjetivo { get; set; }

        [StringLength(500)]
        public string? Descripcion { get; set; }

        [ForeignKey("UsuarioId")]
        public Usuario? Usuario { get; set; }
    }
}